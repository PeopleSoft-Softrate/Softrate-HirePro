import { Component, OnInit, OnDestroy } from '@angular/core';
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
  submitting = false;
  submitted = false;
  submitResult: any = null;
  error = '';

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
        // Initialize answers grid
        this.answers = exam.sections.map((s: any) => s.questions.map(() => ''));
        // Set timers
        this.globalTimerSecs = (exam.totalDuration || 0) * 60;
        this.setSectionTimer();
        this.startGlobalTimer();
        this.startSectionTimer();
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load exam.'; this.loading = false; }
    });
  }

  ngOnDestroy() {
    this.clearTimers();
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
      if (this.globalTimerSecs <= 0) { this.clearTimers(); this.submitExam(); }
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
    if (lastSection) { this.submitExam(); return; }
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

  // ---- Submit ----
  confirmSubmit() {
    if (!confirm('Are you sure you want to submit the exam? This action cannot be undone.')) return;
    this.submitExam();
  }

  submitExam() {
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
          questionIndex: qIdx,
          answer: this.answers[sIdx]?.[qIdx] || ''
        });
      });
    });

    this.resultService.submitExam({
      examId: this.exam._id,
      answers: flatAnswers,
      timeTakenSeconds
    }).subscribe({
      next: (res) => {
        this.submitted = true;
        this.submitting = false;
        this.submitResult = res;
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.message || 'Submission failed. Please try again.');
      }
    });
  }
}
