import { useRef, useEffect } from 'react';
import './preview.css';

interface PreviewProps {
  code: string;
  err: string;
}

const html = `
<html>
  <head></head>
  <body>
    <div id="root"></div>
    <script>
      const handleError = (e) => {
        document.querySelector('#root').innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + e + '</div>'
        console.error(e)
      }

      window.addEventListener('error', (event) => {
        event.preventDefault()
        handleError(event.error)
      })

      window.addEventListener('message', (event) => {
        try {
          eval(event.data)
        } catch(e) {
          handleError(e)
        }
      }, false) 
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
  const iframe = useRef<any>();
  useEffect(() => {
    iframe.current.srcdoc = html;
    setTimeout(() => {
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);
  }, [code]);
  return (
    <div className="preview-wrapper">
      <iframe
        ref={iframe}
        title="code executed"
        sandbox="allow-scripts"
        srcDoc={html}
      />
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default Preview;
