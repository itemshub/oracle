(() => {
    function text(el) {
        return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    }

    // 通用单位转换（支持 K / M / B）
    function parseUnitNumber(str) {
        if (!str) return "";

        const match = str.match(/([\d.,]+)\s*([KMB])?/i);
        if (!match) return "";

        let num = parseFloat(match[1].replace(/,/g, ""));
        const unit = match[2] ? match[2].toUpperCase() : "";

        if (unit === "K") num *= 1000;
        if (unit === "M") num *= 1000000;
        if (unit === "B") num *= 1000000000;

        return Math.round(num * 100) / 100; // 保留两位小数
    }

    // 提取数字（带单位）
    function extractNumber(str) {
        const m = str.match(/[\d.,]+[KMB]?/i);
        return m ? m[0] : "";
    }

    const result = [];
    const cards = document.querySelectorAll(".active-offer");

    cards.forEach(card => {

        // ---- 基本信息 ----
        const nameA = card.querySelector("a.custom-underline");
        const name = nameA ? text(nameA) : "";
        const market_url = nameA ? nameA.href : "";
        const img_url = card.querySelector("a.custom-underline img")?.src ?? "";

        const promoted = !!card.querySelector('[data-template="recommended-info"], .text-orange-400');

        // ---- TrustScore ----
        const trustLink = Array.from(card.querySelectorAll("a"))
            .find(a => a.href.includes("trustpilot.com"));
        const trust_score_text = trustLink ? text(trustLink) : "";

        // ---- Active Offers ----
        let active_offers = "";

        const allTextNodes = Array.from(card.querySelectorAll("*"))
            .map(el => text(el))
            .filter(t => /active offers?/i.test(t));

        for (const t of allTextNodes) {
            const raw = extractNumber(t);
            if (raw) {
                active_offers = parseUnitNumber(raw);
                break;
            }
        }

        // ---- Price（去除美元符号 + 支持单位转换） ----
        let price = "";

        const priceEl = Array.from(card.querySelectorAll("div.font-bold"))
            .find(el => /\$[\d.,]+[KMB]?/i.test(text(el)));

        if (priceEl) {
            const priceRaw = text(priceEl).replace(/[^0-9KMB.,]/gi, "");  
            price = parseUnitNumber(priceRaw);
        }

        // ---- Offer URL ----
        const offerBtn = Array.from(card.querySelectorAll("a"))
            .find(a =>
                (/offer/i.test(a.textContent) || /buy/i.test(a.textContent)) &&
                !a.href.includes("trustpilot")
            );
        const offer_url = offerBtn ? offerBtn.href : "";

        result.push({
            name,
            market_url,
            img_url,
            trust_score_text,
            active_offers,   // 纯数字
            price,           // 纯数字（已去 "$"）
            offer_url,
            promoted
        });
    });

    console.log(result);
    console.log(JSON.stringify(result, null, 2));
    return result;
})();
