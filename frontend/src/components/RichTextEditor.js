import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = forwardRef(({ value, onChange, placeholder, className }, ref) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Define toolbar/options inside effect to keep hook deps stable
    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean']
    ];

    const formats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'indent', 'link', 'image'
    ];

    if (editorRef.current && !quillRef.current) {
      // Initialize Quill
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Write your content here...',
        modules: {
          toolbar: toolbarOptions
        },
        formats: formats
      });

      quillRef.current = quill;
      setIsReady(true);

      // Set initial value if provided
      if (value) {
        quill.root.innerHTML = value;
      }

      // Listen for text changes
      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        if (onChange) {
          onChange(html);
        }
      });

      // Handle image uploads (placeholder for future implementation)
      quill.getModule('toolbar').addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files[0];
          if (file) {
            // Placeholder for image upload functionality (no console warning)
            // You can implement image upload logic here
          }
        };
      });
    }

    return () => {
      if (quillRef.current) {
        // Clean up Quill instance
        const toolbar = quillRef.current.getModule('toolbar');
        if (toolbar) {
          toolbar.container.remove();
        }
        quillRef.current = null;
      }
    };
  }, [placeholder, value, onChange]);

  // Update content when value prop changes (but not from internal changes)
  useEffect(() => {
    if (quillRef.current && isReady && value !== undefined) {
      const currentHtml = quillRef.current.root.innerHTML;
      if (currentHtml !== value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value, isReady]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    getQuill: () => quillRef.current,
    getHTML: () => quillRef.current ? quillRef.current.root.innerHTML : '',
    getText: () => quillRef.current ? quillRef.current.getText() : '',
    setHTML: (html) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = html;
      }
    },
    focus: () => {
      if (quillRef.current) {
        quillRef.current.focus();
      }
    },
    blur: () => {
      if (quillRef.current) {
        quillRef.current.blur();
      }
    }
  }));

  return (
    <div className={`relative ${className || ''}`}>
      <div
        ref={editorRef}
        className="min-h-[300px] border border-gray-300 rounded-md"
        style={{ minHeight: '300px' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-300 rounded-md">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
