
const style = document.createElement('style');
style.textContent = `
  .collapsed-gpt-answer {
    display: none;
  }
  .collapse-btn {
    cursor: pointer;
    color: #888;
    font-size: 0.85em;
    margin-bottom: 4px;
    display: inline-block;
  }
`;
document.head.appendChild(style);

// ===================
// 折りたたみ関数
// ===================
function toggleCollapse(answerContent) {
  answerContent.classList.toggle('collapsed-gpt-answer');
}

function addCollapseFeature(answerElem) {
  // まだボタンが入っていないかチェック
  if (answerElem.querySelector('.collapse-btn')) return;

  const collapseBtn = document.createElement('div');
  collapseBtn.innerText = '▲ Collapse';
  collapseBtn.className = 'collapse-btn';

  // 回答本文を探す（セレクタは適宜調整）
  const answerContent = answerElem.querySelector('div.markdown');
  if (!answerContent) return;

  collapseBtn.addEventListener('click', () => {
    toggleCollapse(answerContent);
    collapseBtn.innerText = answerContent.classList.contains('collapsed-gpt-answer')
      ? '▼ Expand'
      : '▲ Collapse';
  });

  // 回答の一番上にボタンを挿入
  answerElem.insertBefore(collapseBtn, answerElem.firstChild);
}

// ===================
// MutationObserverで新回答を監視
// ===================

// ChatGPTの会話を包むコンテナを探す。適宜セレクタを変更。
const chatContainer = document.querySelector('main') || document.body;

// 追加されたノードにassistant要素が含まれていれば折りたたみ機能を付ける
function handleMutations(mutations) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 自身がassistantかどうかチェック
          if (node.matches?.('[data-message-author-role="assistant"]')) {
            addCollapseFeature(node);
          }
          // 子孫要素にもassistantがあるかもしれないから検索
          const childAssistants = node.querySelectorAll?.('[data-message-author-role="assistant"]');
          childAssistants?.forEach((assistant) => addCollapseFeature(assistant));
        }
      });
    }
  }
}

const observer = new MutationObserver(handleMutations);
observer.observe(chatContainer, { childList: true, subtree: true });

// 最初から存在する回答にもボタンをつける
const existingAnswers = chatContainer.querySelectorAll('[data-message-author-role="assistant"]');
existingAnswers.forEach((elem) => addCollapseFeature(elem));

