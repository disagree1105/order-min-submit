const form = document.querySelector('#calculator-form');
const numbersInput = document.querySelector('#numbers');
const completedInput = document.querySelector('#completed');
const requiredInput = document.querySelector('#required');
const error = document.querySelector('#error');
const resultState = document.querySelector('#result-state');
const resultCaption = document.querySelector('#result-caption');
const resultPanel = document.querySelector('.result-panel');
const total = document.querySelector('#total');
const overage = document.querySelector('#overage');
const combination = document.querySelector('#combination');
const count = document.querySelector('#count');
const targetDisplay = document.querySelector('#target-display');
const inputCount = document.querySelector('#input-count');
const clearButtons = document.querySelectorAll('.clear-btn');
const submitAll = document.querySelector('#submit-all');
const submitAllText = document.querySelector('#submit-all-text');
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
    const candidateOver = candidate.sum - target;
    const bestOver = best.sum - target;
    // 第一优先级：超额量更小的优先（刚好达到目标值算超额量为 0，天然最小）
    if (candidateOver < bestOver) {
      best = candidate;
      return;
    }
    if (candidateOver > bestOver) {
      return;
    }
    // 第二优先级：超额量相同时，选数字个数更少的
    if (candidate.values.length < best.values.length) {
      best = candidate;
      return;
    }
    // 个数也相同，无需更新
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

// 已完成输入框获焦时，值为 0 则清空
completedInput.addEventListener('focus', () => {
  if (Number(completedInput.value) === 0) {
    completedInput.value = '';
  }
});

// 清空叉叉按钮逻辑
function updateClearButton(input, btn) {
  btn.hidden = input.value === '';
}

[...clearButtons].forEach((btn) => {
  const input = document.querySelector(`#${btn.dataset.target}`);
  // 初始化按钮可见性
  updateClearButton(input, btn);
  // 输入时更新按钮可见性
  input.addEventListener('input', () => updateClearButton(input, btn));
  // 点击叉叉清空输入
  btn.addEventListener('click', () => {
    input.value = '';
    input.focus();
    updateClearButton(input, btn);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  error.textContent = '';
  submitAll.hidden = true;
  const numbers = parseNumbers(numbersInput.value);
  const completed = completedInput.value === '' ? 0 : Number(completedInput.value);
  const required = requiredInput.value === '' ? 0 : Number(requiredInput.value);
  if (!numbers.length) { error.textContent = '请输入至少一个大于 0 的数字。'; return; }
  if (!Number.isFinite(completed) || completed < 0) { error.textContent = '已完成数量不能小于 0。'; return; }
  if (!Number.isFinite(required) || required < 0) { error.textContent = '请输入有效的总需求值。'; return; }
  const target = required - completed;
  if (target < 0) { error.textContent = '已完成数量不能大于总需求。'; return; }
  if (numbers.length > 28) { error.textContent = '数字数量最多支持 28 个，请减少输入后再试。'; return; }
  latestResult = findMinimumCombination(numbers, target);
  if (!latestResult) {
    // 所有数字加起来都小于目标值，显示大字提示
    resultState.hidden = false;
    // 隐藏最小超额总和的具体数值，清空上一次的组合和元数据
    total.textContent = '—';
    overage.textContent = '—';
    count.textContent = '0 个';
    targetDisplay.textContent = '—';
    inputCount.textContent = '—';
    combination.innerHTML = '';
    // 显示大字提示
    const totalSum = numbers.reduce((a, b) => a + b, 0);
    resultCaption.textContent = '所有订单总和不足，全部提交即可';
    submitAllText.textContent = `所有订单累计总和：${formatNumber(totalSum)}，小于目标总和：${formatNumber(target)}，全部提交吧！`;
    submitAll.hidden = false;
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  // 找到结果，隐藏全部提交提示，显示计算结果
  submitAll.hidden = true;
  resultState.hidden = false;
  resultCaption.textContent = '已找到最接近目标值的组合';
  total.textContent = formatNumber(latestResult.sum);
  const diff = latestResult.sum - target;
  overage.textContent = diff > 0 ? `超过目标值 ${formatNumber(diff)}` : '刚好达到目标值';
  count.textContent = `${latestResult.values.length} 个`;
  targetDisplay.textContent = formatNumber(target);
  inputCount.textContent = `${numbers.length} 个数字`;
  combination.innerHTML = latestResult.values.map((value) => `<span class="chip">${formatNumber(value)}</span>`).join('');
  // 点击计算后页面滚动到计算结果
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
