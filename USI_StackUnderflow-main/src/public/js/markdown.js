// Markdown editor (bold, italics, code, images etc)





const textEditor = document.querySelector('.text-editor');
const previewArea = document.querySelector('.preview');
const converter = new showdown.Converter();

const renderPreview = (value) => {
    const html = converter.makeHtml(value);
    previewArea.innerHTML = html;
}


textEditor.addEventListener('keyup', (e) => {
    const value = e.target.value;
    const html = converter.makeHtml(value);
    window.localStorage.setItem('markdown', value);
    previewArea.innerHTML = html;
    console.log(value);
});

const storedMarkdown = window.localStorage.getItem('markdown');

if (storedMarkdown) {
    textEditor.value = storedMarkdown;
    renderPreview(storedMarkdown);
}