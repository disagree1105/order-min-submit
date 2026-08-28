const form = document.querySelector('#calculator-form');
const numbersInput = document.querySelector('#numbers');
const targetInput = document.querySelector('#target');
const error = document.querySelector('#error');
const emptyState = document.querySelector('#empty-state');
const resultState = document.querySelector('#result-state');
const resultCaption = document.querySelector('#result-caption');
const total = document.querySelector('#total');
const overage = document.querySelector('#overage');
const combination = document.querySelector('#combination');
const count = document.querySelector('#count');
const targetDisplay = document.querySelector('#target-display');
const inputCount = document.querySelector('#input-count');
const copyButton = document.querySelector('#copy-button');
let latestResult = null;

function parseNumbers(value) {
  const tokens = value.trim().split(/[\s,，;；]+/).filter(Boolean);
  return tokens.map((token) => Number(token)).filter((number) => Number.isFinite(number) && number > 0);
}

function findMinimumCombination(numbers, target) {
  let best = null;
  function search(index, sum, chosen) {
    if (sum > target && (!best || sum < best.sum || (sum === best.sum && chosen.length < best.values.length))) {
      best = { sum, values: [...chosen] };
    }
    if (index >= numbers.length || (best && sum >= best.sum)) return;
    for (let i = index; i < numbers.length; i += 1) {
      search(i + 1, sum + numbers[i], [...chosen, numbers[i]]);
    }
  }
  search(0, 0, []);
  return best;
}

function formatNumber(value) { return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''); }

form.addEventListener('submit', (event) => {
  event.preventDefault();
  error.textContent = '';
  const numbers = parseNumbers(numbersInput.value);
  const target = Number(targetInput.value);
  if (!numbers.length) { error.textContent = '请输入至少一个大于 0 的数字。'; return; }
  if (!Number.isFinite(target)) { error.textContent = '请输入有效的目标值。'; return; }
  if (numbers.length > 28) { error.textContent = '数字数量最多支持 28 个，请减少输入后再试。'; return; }
  latestResult = findMinimumCombination(numbers, target);
  emptyState.hidden = Boolean(latestResult);
  resultState.hidden = !latestResult;
  if (!latestResult) { resultCaption.textContent = '没有找到符合条件的组合'; return; }
  resultCaption.textContent = '已找到最接近目标值的组合';
  total.textContent = formatNumber(latestResult.sum);
  overage.textContent = `超过目标值 ${formatNumber(latestResult.sum - target)}`;
  count.textContent = `${latestResult.values.length} 个`;
  targetDisplay.textContent = formatNumber(target);
  inputCount.textContent = `${numbers.length} 个数字`;
  combination.innerHTML = latestResult.values.map((value) => `<span class="chip">${formatNumber(value)}</span>`).join('');
});

copyButton.addEventListener('click', async () => {
  if (!latestResult) return;
  const text = `最小超额总和：${formatNumber(latestResult.sum)}\n组合：${latestResult.values.map(formatNumber).join(' + ')}`;
  try { await navigator.clipboard.writeText(text); copyButton.firstElementChild.textContent = '已复制'; setTimeout(() => { copyButton.firstElementChild.textContent = '复制结果'; }, 1600); } catch { error.textContent = '复制失败，请手动选择结果。'; }
});
