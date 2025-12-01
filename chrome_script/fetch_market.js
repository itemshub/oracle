(function () {
    function parseNumber(str) {
        if (!str) return 0;
        str = str.replace(/[\$,]/g, '').trim();
        const unit = str.slice(-1).toUpperCase();

        let num = parseFloat(str);
        if (isNaN(num)) return 0;

        if (unit === 'K') return num * 1000;
        if (unit === 'M') return num * 1000000;
        if (unit === 'B') return num * 1000000000;
        return num;
    }

    const result = [];

    document.querySelectorAll("a[href*='/markets/']").forEach(a => {
        const url = a.href;
        const box = a.querySelector(".md\\:flex") || a.querySelector(".md:hidden");
        if (!box) return;

        // 名称
        const name = box.querySelector("img.h-5, img.h-6")?.nextSibling?.textContent?.trim()
            || box.querySelector("div.font-bold")?.textContent?.trim()
            || "";

        // 所有指标值区域
        const values = [...box.querySelectorAll(".font-bold.text-lg")].map(e =>
            e.textContent.trim()
        );

        if (values.length < 5) return;

        const [itemsStr, offersStr, valueStr, discountStr, visitsStr] = values;

        const obj = {
            name,
            url,
            items: parseNumber(itemsStr),
            offers: parseNumber(offersStr),
            value: parseNumber(valueStr.replace("$", "")),
            avg_discount: discountStr.trim(),
            visits: parseNumber(visitsStr)
        };

        result.push(obj);
    });

    console.log("Parsed Markets:", result);
    return result;
})();
