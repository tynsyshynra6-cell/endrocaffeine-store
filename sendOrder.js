exports.handler = async function(event, context) {
    // التأكد من أن الطلب من نوع POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        
        // استدعاء المفاتيح السرية من Netlify (مخفية عن الزوار)
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        // تجهيز رسالة التلغرام
        const message = `🛒 *طلب جديد من متجر Endrocaffeine!*\n\n` +
                        `🔑 *رقم الطلب:* \`${data.orderId}\`\n` +
                        `⌚ *الساعة:* ${data.title}\n` +
                        `💰 *السعر:* ${data.price}\n` +
                        `👤 *الاسم:* ${data.name}\n` +
                        `📞 *الهاتف:* ${data.phone}\n` +
                        `📍 *العنوان:* ${data.state}`;

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        // إرسال الرسالة إلى تلغرام
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
        });

        if (!response.ok) throw new Error("فشل إرسال الرسالة");

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};