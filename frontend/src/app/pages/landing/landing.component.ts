import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  words: string[] = ['precision.', 'speed.'];
  currentWordIndex: number = 0;
  currentText: string = '';
  isDeleting: boolean = false;
  typingSpeed: number = 150;
  private timer: any;

  ngOnInit() {
    this.type();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  type() {
    const currentWord = this.words[this.currentWordIndex];
    
    if (this.isDeleting) {
      this.currentText = currentWord.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = currentWord.substring(0, this.currentText.length + 1);
    }

    let typeSpeed = this.isDeleting ? this.typingSpeed / 2 : this.typingSpeed;

    if (!this.isDeleting && this.currentText === currentWord) {
      typeSpeed = 2000; // Pause at end of word
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
      typeSpeed = 500; // Pause before typing next word
    }

    this.timer = setTimeout(() => this.type(), typeSpeed);
  }
}
