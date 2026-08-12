exports.handler = async function(event, context) {
    // التأكد من أن الطلب من نوع POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        
        // استدعاء المفاتيح من إعدادات Netlify بالأسماء الدقيقة التي وجدتها
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        // التحقق من وجود المتغيرات في Netlify
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error("خطأ: المتغيرات البيئية غير موجودة في Netlify");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing Environment Variables" })
            };
        }

        // تجهيز رسالة التلغرام
        const message = `🛒 *طلب جديد من متجر Endrocaffeine!*\n\n` +
                        `🔑 *رقم الطلب:* \`${data.orderId || 'غير متوفر'}\`\n` +
                        `⌚ *الساعة:* ${data.title || 'غير متوفر'}\n` +
                        `💰 *السعر:* ${data.price || 'غير متوفر'}\n` +
                        `👤 *الاسم:* ${data.name}\n` +
                        `📞 *الهاتف:* ${data.phone}\n` +
                        `📍 *العنوان:* ${data.state}`;

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        // إرسال الرسالة إلى تلغرام
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: message, 
                parse_mode: 'Markdown' 
            })
        });

        const responseData = await response.json();

        // إذا رفض تلغرام الرسالة، سيكتب لنا السبب في السجلات
        if (!response.ok) {
            console.error("تلغرام رفض الطلب:", responseData);
            throw new Error(`خطأ من تلغرام: ${responseData.description}`);
        }

        // نجاح العملية
        return { statusCode: 200, body: JSON.stringify({ success: true, message: "تم الإرسال بنجاح" }) };
        
    } catch (error) {
        console.error("حدث خطأ في الخادم:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
