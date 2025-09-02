import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, fromEvent, timer } from 'rxjs';
import { debounceTime, switchMap, take } from 'rxjs/operators';
import { QuillEditorComponent } from 'ngx-quill';

import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild(QuillEditorComponent, { static: true }) editor!: QuillEditorComponent;

  content: any;
  documentId!: string;
  private subscriptions = new Subscription();

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id')!;
    if (!this.documentId) return;

    this.loadInitialContent();
    this.socketService.joinDocument(this.documentId);

    const changesSub = this.socketService.receiveDocumentChanges().subscribe(delta => {
        if (this.editor.quillEditor) {
            this.editor.quillEditor.updateContents(delta, 'silent');
        }
    });
    this.subscriptions.add(changesSub);
  }

  loadInitialContent() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    this.http.get(`http://localhost:3001/api/documents/${this.documentId}`, { headers })
      .pipe(take(1))
      .subscribe(doc => {
        this.content = (doc as any).content;
      });
  }

  onContentChanged(event: any): void {
    // event.source can be 'user', 'api', or 'silent'
    if (event.source === 'user') {
        this.socketService.sendDocumentChange(event.delta, this.documentId);
        this.saveDocument(event.editor.getContents());
    }
  }

  saveDocument(content: any) {
      this.socketService.saveDocument({ documentId: this.documentId, content: content });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}