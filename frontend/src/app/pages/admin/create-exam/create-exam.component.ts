import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.css']
})
export class CreateExamComponent implements OnInit {
  isEdit = false;
  examId = '';
  loading = false;
  saving = false;
  error = '';

  exam = {
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'active',
    sections: [] as any[]
  };

  constructor(
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id') || '';
    if (this.examId) {
      this.isEdit = true;
      this.loading = true;
      this.examService.getExam(this.examId).subscribe({
        next: (e) => {
          this.exam.title = e.title;
          this.exam.description = e.description || '';
          this.exam.status = e.status;
          this.exam.sections = e.sections.map((s: any) => ({
            name: s.name,
            duration: s.duration,
            questions: s.questions.map((q: any) => ({
              _id: q._id,
              text: q.text,
              type: q.type,
              options: q.options || ['', '', '', ''],
              correctAnswer: q.correctAnswer || '',
              marks: q.marks || 1,
              timeLimit: q.timeLimit || 30,
              rubric: q.rubric || []
            }))
          }));
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load exam'; this.loading = false; }
      });
    }
  }

  addSection() {
    this.exam.sections.push({ name: '', duration: 5, questions: [] });
  }

  removeSection(i: number) {
    this.exam.sections.splice(i, 1);
  }

  addQuestion(sIdx: number) {
    this.exam.sections[sIdx].questions.push({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      timeLimit: 30,
      rubric: []
    });
  }

  removeQuestion(sIdx: number, qIdx: number) {
    this.exam.sections[sIdx].questions.splice(qIdx, 1);
  }

  onTypeChange(sIdx: number, qIdx: number) {
    const q = this.exam.sections[sIdx].questions[qIdx];
    if (q.type === 'mcq') {
      q.options = ['', '', '', ''];
      q.rubric = [];
      q.timeLimit = 30;
    } else {
      q.options = [];
      q.correctAnswer = '';
      q.rubric = [{ criterion: '', marks: 0 }];
      q.timeLimit = 420;
    }
  }

  addRubric(sIdx: number, qIdx: number) {
    this.exam.sections[sIdx].questions[qIdx].rubric.push({ criterion: '', marks: 0 });
  }

  removeRubric(sIdx: number, qIdx: number, rIdx: number) {
    this.exam.sections[sIdx].questions[qIdx].rubric.splice(rIdx, 1);
  }

  get totalDuration() {
    return this.exam.sections.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
  }

  get totalMarks() {
    return this.exam.sections.reduce((sum, s) =>
      sum + s.questions.reduce((qs: number, q: any) => qs + (Number(q.marks) || 0), 0), 0);
  }

  get totalQuestions() {
    return this.exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
  }

  save(status?: 'draft' | 'active') {
    if (!this.exam.title) { this.error = 'Exam title is required'; return; }
    if (!this.exam.sections.length) { this.error = 'Add at least one section'; return; }

    if (status) this.exam.status = status;
    this.saving = true;
    this.error = '';

    const payload = {
      title: this.exam.title,
      description: this.exam.description,
      status: this.exam.status,
      sections: this.exam.sections
    };

    const req = this.isEdit
      ? this.examService.updateExam(this.examId, payload)
      : this.examService.createExam(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/admin/exams']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Save failed';
      }
    });
  }
}
