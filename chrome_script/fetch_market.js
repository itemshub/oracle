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

        // desktop 或 mobile box
        const box = a.querySelector(".md\\:flex") || a.querySelector(".md:hidden");
        if (!box) return;

        // logo 图片
        const logo = box.querySelector("img.inline-block");
        const logo_url = logo ? logo.src : "";

        // 名称
        let name = "";
        if (logo && logo.nextSibling) {
            name = logo.nextSibling.textContent.trim();
        } else {
            name = box.querySelector("div.font-bold")?.textContent?.trim() || "";
        }

        // 所有指标（前 5 个）
        const values = [...box.querySelectorAll(".font-bold.text-lg")].map(e =>
            e.textContent.trim()
        );

        if (values.length < 5) return;

        const [itemsStr, offersStr, valueStr, discountStr, visitsStr] = values;

        const obj = {
            name,
            url,
            logo_url,
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
