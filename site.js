// Optional: compare a downloaded file with the SHA-256 values printed on this page.
// The page works without this script; the form stays hidden when the browser cannot hash files.
(() => {
  const form = document.getElementById('compare');
  const published = [...document.querySelectorAll('[data-sha256][data-file]')]
    .map(el => ({ file: el.dataset.file, sha: el.dataset.sha256.toLowerCase() }));
  if (!form || !published.length || !window.crypto?.subtle || !window.isSecureContext || !Blob.prototype.arrayBuffer) return;

  const input = document.getElementById('compare-file');
  const result = document.getElementById('compare-result');
  const maxBytes = 300_000_000;
  let run = 0;

  form.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('change', async () => {
    const file = input.files[0];
    const mine = ++run;
    result.textContent = '';
    if (!file) return;
    if (file.size > maxBytes) { result.textContent = '파일이 너무 커서 이 브라우저에서 비교하지 않습니다. PowerShell로 확인하세요.'; return; }
    result.textContent = '확인하는 중…';
    try {
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      if (mine !== run) return;
      const sha = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      const match = published.find(p => p.sha === sha);
      if (match) {
        result.textContent = match.file === file.name
          ? `${match.file}의 값과 같습니다.`
          : `${match.file}의 값과 같습니다. 파일 이름만 다릅니다.`;
      } else {
        result.textContent = '이 페이지의 값과 다릅니다. 받은 파일을 지우고 다시 받으세요.';
      }
    } catch {
      if (mine === run) result.textContent = '파일을 읽지 못했습니다. 다시 선택하거나 PowerShell로 확인하세요.';
    }
  });
  form.hidden = false;
})();
