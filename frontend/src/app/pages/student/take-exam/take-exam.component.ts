import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ResultService } from '../../../services/result.service';

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.css']
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam: any = null;
  loading = true;
  examReady = false;  // true after exam loads, waiting for student to click Start
  examStarted = false; // true after student clicks Start & fullscreen is entered
  submitting = false;
  submitted = false;
  submitResult: any = null;
  error = '';
  showExitConfirm = false;
  showFinalSubmitConfirm = false;

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.examStarted && !this.submitted && !this.submitting) {
      window.history.pushState(null, '', window.location.href);
      this.showExitConfirm = true;
    }
  }

  cancelExit() {
    this.showExitConfirm = false;
  }

  confirmExit() {
    this.showExitConfirm = false;
    this.submit(true);
  }

  // Security
  screenChangesCount = 0;
  showTabWarning = false;
  warningMessage = '';
  showFullscreenOverlay = false; // blocks exam view when fullscreen is exited
  private visibilityHandler!: () => void;
  private copyHandler!: (e: Event) => void;
  private cutHandler!: (e: Event) => void;
  private contextMenuHandler!: (e: Event) => void;
  private fullscreenChangeHandler!: () => void;
  private isFullscreen = false;

  // Current navigation
  currentSectionIndex = 0;
  currentQuestionIndex = 0;

  // Answers: answers[sectionIndex][questionIndex]
  answers: string[][] = [];

  // Timers
  globalTimerSecs = 0;
  sectionTimerSecs = 0;
  private globalInterval: any;
  private sectionInterval: any;

  // Track elapsed
  startTime = Date.now();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        this.exam = exam;
        
        // Add _originalIndex and shuffle questions & options
        this.exam.sections.forEach((sec: any) => {
          sec.questions.forEach((q: any, qIdx: number) => {
            q._originalIndex = qIdx;
            if (q.options && q.options.length > 0) {
              this.shuffleArray(q.options);
            }
          });
          this.shuffleArray(sec.questions);
        });

        // Initialize answers grid based on shuffled length
        this.answers = exam.sections.map((s: any) => s.questions.map(() => ''));
        // Set timers (but don't start yet — wait for user to click Start)
        this.globalTimerSecs = (exam.totalDuration || 0) * 60;
        this.setSectionTimer();
        this.loading = false;
        this.examReady = true;
      },
      error: () => { this.error = 'Failed to load exam.'; this.loading = false; }
    });

    // Block copy/cut/paste/contextmenu
    this.copyHandler = (e: Event) => e.preventDefault();
    this.cutHandler = (e: Event) => e.preventDefault();
    this.contextMenuHandler = (e: Event) => e.preventDefault();
    document.addEventListener('copy', this.copyHandler);
    document.addEventListener('cut', this.cutHandler);
    document.addEventListener('contextmenu', this.contextMenuHandler);

    // Tab switch detection
    this.visibilityHandler = () => {
      if (document.hidden && this.examStarted && !this.submitted) {
        this.handleViolation('Tab switch detected!');
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Fullscreen exit detection — show blocking overlay
    this.fullscreenChangeHandler = () => {
      if (!document.fullscreenElement && this.examStarted && !this.submitted) {
        this.handleViolation('Fullscreen exit detected!');
        this.showFullscreenOverlay = true;
      } else if (document.fullscreenElement) {
        this.showFullscreenOverlay = false;
      }
    };
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy() {
    this.clearTimers();
    document.removeEventListener('copy', this.copyHandler);
    document.removeEventListener('cut', this.cutHandler);
    document.removeEventListener('contextmenu', this.contextMenuHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
    this.exitFullscreen();
  }

  // ---- Fullscreen ----
  enterFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    }
    this.isFullscreen = true;
  }

  exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    this.isFullscreen = false;
  }

  // Fisher-Yates shuffle
  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Called by the "Start Exam" button — real user click provides the gesture
  startExam() {
    this.enterFullscreen();
    this.examStarted = true;
    this.startTime = Date.now();
    // Push state so back button triggers popstate without leaving page immediately
    window.history.pushState(null, '', window.location.href);
    this.startGlobalTimer();
    this.startSectionTimer();
  }

  // Called from the blocking overlay button
  returnToFullscreen() {
    this.enterFullscreen();
    // Overlay hides automatically via fullscreenchange event
  }

  // Block PrintScreen and common screenshot/devtools shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    // Block PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      navigator.clipboard?.writeText('').catch(() => {});
      return;
    }
    // Block Ctrl+P (print), Ctrl+S (save), Ctrl+Shift+I (devtools), F12
    if (
      (e.ctrlKey && ['p', 's', 'u'].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 's'].includes(e.key.toLowerCase())) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return;
    }
  }

  get currentSection(): any {
    return this.exam?.sections?.[this.currentSectionIndex];
  }

  get currentQuestion(): any {
    return this.currentSection?.questions?.[this.currentQuestionIndex];
  }

  get currentAnswer(): string {
    return this.answers[this.currentSectionIndex]?.[this.currentQuestionIndex] || '';
  }

  set currentAnswer(val: string) {
    this.answers[this.currentSectionIndex][this.currentQuestionIndex] = val;
  }

  setSectionTimer() {
    const section = this.currentSection;
    if (section) this.sectionTimerSecs = (section.duration || 0) * 60;
  }

  // ---- Timers ----
  startGlobalTimer() {
    this.globalInterval = setInterval(() => {
      this.globalTimerSecs--;
      if (this.globalTimerSecs <= 0) { this.clearTimers(); this.submit(); }
    }, 1000);
  }

  startSectionTimer() {
    this.clearSectionTimer();
    this.sectionInterval = setInterval(() => {
      this.sectionTimerSecs--;
      if (this.sectionTimerSecs <= 0) { this.autoAdvanceSection(); }
    }, 1000);
  }

  clearSectionTimer() { clearInterval(this.sectionInterval); }
  clearTimers() { clearInterval(this.globalInterval); clearInterval(this.sectionInterval); }

  autoAdvanceSection() {
    clearInterval(this.sectionInterval);
    const lastSection = this.currentSectionIndex >= this.exam.sections.length - 1;
    if (lastSection) { this.submit(); return; }
    this.currentSectionIndex++;
    this.currentQuestionIndex = 0;
    this.setSectionTimer();
    this.startSectionTimer();
  }

  // ---- Navigation ----
  goToQuestion(sIdx: number, qIdx: number) {
    this.currentSectionIndex = sIdx;
    this.currentQuestionIndex = qIdx;
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) { this.currentQuestionIndex--; return; }
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.currentQuestionIndex = this.currentSection.questions.length - 1;
    }
  }

  nextQuestion() {
    const section = this.currentSection;
    if (this.currentQuestionIndex < section.questions.length - 1) { this.currentQuestionIndex++; return; }
    if (this.currentSectionIndex < this.exam.sections.length - 1) {
      // Move to next section — reset section timer
      clearInterval(this.sectionInterval);
      this.currentSectionIndex++;
      this.currentQuestionIndex = 0;
      this.setSectionTimer();
      this.startSectionTimer();
    }
  }

  get isLastQuestion(): boolean {
    const lastSection = this.currentSectionIndex === this.exam.sections.length - 1;
    const lastQ = this.currentQuestionIndex === this.currentSection.questions.length - 1;
    return lastSection && lastQ;
  }

  isAnswered(sIdx: number, qIdx: number): boolean {
    return !!this.answers[sIdx]?.[qIdx];
  }

  getTotalAnswered(): number {
    return this.answers.flat().filter(a => !!a).length;
  }

  getTotalQuestions(): number {
    return this.exam.sections.reduce((s: number, sec: any) => s + sec.questions.length, 0);
  }

  // ---- Format timer ----
  formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get globalTimerClass(): string {
    if (this.globalTimerSecs <= 60) return 'danger';
    if (this.globalTimerSecs <= 300) return 'warning';
    return '';
  }

  get sectionTimerClass(): string {
    if (this.sectionTimerSecs <= 30) return 'danger';
    if (this.sectionTimerSecs <= 60) return 'warning';
    return '';
  }

  // Security Violation Handler
  handleViolation(reason: string) {
    this.screenChangesCount++;
    this.warningMessage = `${reason} (${this.screenChangesCount}/3 malpractices).`;
    this.showTabWarning = true;
    setTimeout(() => this.showTabWarning = false, 5000);

    if (this.screenChangesCount > 3) {
      this.warningMessage = 'Maximum malpractices exceeded. Auto-submitting exam...';
      this.showTabWarning = true;
      setTimeout(() => this.submit(true), 2000);
    }
  }

  // ---- Submit ----
  confirmSubmit() {
    this.showFinalSubmitConfirm = true;
  }

  cancelFinalSubmit() {
    this.showFinalSubmitConfirm = false;
  }

  executeFinalSubmit() {
    this.showFinalSubmitConfirm = false;
    this.submit();
  }

  submit(isAutoSubmit = false) {
    if (this.submitting || this.submitted) return;
    this.clearTimers();
    this.submitting = true;
    const timeTakenSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    const flatAnswers: any[] = [];
    this.exam.sections.forEach((section: any, sIdx: number) => {
      section.questions.forEach((q: any, qIdx: number) => {
        flatAnswers.push({
          questionId: q._id,
          sectionIndex: sIdx,
          questionIndex: q._originalIndex !== undefined ? q._originalIndex : qIdx,
          answer: this.answers[sIdx]?.[qIdx] || ''
        });
      });
    });

    this.resultService.submitExam({
      examId: this.exam._id,
      answers: flatAnswers,
      timeTakenSeconds,
      screenChanges: this.screenChangesCount,
      autoSubmitted: isAutoSubmit
    }).subscribe({
      next: (res) => {
        this.submitted = true;
        this.submitting = false;
        this.submitResult = res;
        this.exitFullscreen();
        this.router.navigate(['/student/result', this.submitResult.resultId]);
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.message || 'Submission failed. Please try again.');
      }
    });
  }
}
