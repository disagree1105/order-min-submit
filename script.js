const form = document.querySelector('#calculator-form');
const numbersInput = document.querySelector('#numbers');
const completedInput = document.querySelector('#completed');
const requiredInput = document.querySelector('#required');
const error = document.querySelector('#error');
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
  function consider(candidate) {
    if (!best) {
      best = candidate;
      return;
    }
    // 优先选总和更接近目标（不超过或刚好达到目标）的组合
    // 如果都超过目标，选超过更少的；如果一个刚好达到目标，优先选它
    const candidateOver = candidate.sum - target;
    const bestOver = best.sum - target;
    // 如果候选未超过目标但达到了目标值（sum === target），优先选它
    if (candidate.sum === target && best.sum !== target) {
      best = candidate;
      return;
    }
    // 优先选数字个数更少的
    if (candidate.values.length < best.values.length) {
      best = candidate;
      return;
    }
    if (candidate.values.length === best.values.length && candidateOver < bestOver) {
      best = candidate;
      return;
    }
    // 如果个数相同、超过量相同，无需更新
  }
  function search(index, sum, chosen) {
    // 如果总和已经达到或超过目标，记录候选
    if (sum >= target) {
      consider({ sum, values: [...chosen] });
      // 不再继续往上加，因为再加只会更大
      return;
    }
    if (index >= numbers.length) return;
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
  const completed = completedInput.value === '' ? 0 : Number(completedInput.value);
  const required = Number(requiredInput.value);
  if (!numbers.length) { error.textContent = '请输入至少一个大于 0 的数字。'; return; }
  if (!Number.isFinite(completed) || completed < 0) { error.textContent = '已完成数量不能小于 0。'; return; }
  if (!Number.isFinite(required) || required < 0) { error.textContent = '请输入有效的总需求值。'; return; }
  const target = required - completed;
  if (target < 0) { error.textContent = '已完成数量不能大于总需求。'; return; }
  if (numbers.length > 28) { error.textContent = '数字数量最多支持 28 个，请减少输入后再试。'; return; }
  latestResult = findMinimumCombination(numbers, target);
  resultState.hidden = !latestResult;
  if (!latestResult) { resultCaption.textContent = '没有找到符合条件的组合'; return; }
  resultCaption.textContent = '已找到最接近目标值的组合';
  total.textContent = formatNumber(latestResult.sum);
  const diff = latestResult.sum - target;
  overage.textContent = diff > 0 ? `超过目标值 ${formatNumber(diff)}` : '刚好达到目标值';
  count.textContent = `${latestResult.values.length} 个`;
  targetDisplay.textContent = formatNumber(target);
  inputCount.textContent = `${numbers.length} 个数字`;
  combination.innerHTML = latestResult.values.map((value) => `<span class="chip">${formatNumber(value)}</span>`).join('');
});

copyButton.addEventListener('click', async () => {
  if (!latestResult) return;
  const diff = latestResult.sum - target;
  const overText = diff > 0 ? `超过目标值 ${formatNumber(diff)}` : '刚好达到目标值';
  const text = `最小超额总和：${formatNumber(latestResult.sum)}（${overText}）\n组合：${latestResult.values.map(formatNumber).join(' + ')}`;
  try { await navigator.clipboard.writeText(text); copyButton.firstElementChild.textContent = '已复制'; setTimeout(() => { copyButton.firstElementChild.textContent = '复制结果'; }, 1600); } catch { error.textContent = '复制失败，请手动选择结果。'; }
});
