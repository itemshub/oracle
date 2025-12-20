(() => {
  const results = [];

  // 选中所有商品卡片（a.item）
  const items = document.querySelectorAll('a.item');

  items.forEach(item => {
    // 商品名（来自图片 alt，最稳定）
    const img = item.querySelector('img[alt]');
    const name = img ? img.getAttribute('alt') : null;

    // 价格（$xxx.xxx）
    const priceEl = item.querySelector('strong.font-dm-mono');
    const price = priceEl
      ? priceEl.innerText.replace('$', '').trim()
      : null;

    if (name && price) {
      results.push({ name, price });
    }
  });

  // 打印结果
  console.log(results);

  // 方便复制
  return results;
})();
