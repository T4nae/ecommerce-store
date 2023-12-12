import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Fingerprint } from "@/components/analytics";
import analysisPost from "@/lib/analysis_post";
import { Product } from "@/types";

interface EventProps {
    Fingerprint: Fingerprint;
    FirstVisit: boolean;
    expireTime: Date | undefined;
    setFingerprint: () => void;
    setFirstVisit: () => void;
    addToCartEvent: (productId: string) => void;
    reachedCheckoutEvent: (orderValue: string) => void;
    convertedEvent: (status: string) => void;
}

const useEvent = create(
    persist<EventProps>(
        (set, get) => ({
            Fingerprint: {
                userAgent: "",
                language: "",
                pixelRatio: 0,
                hardwareConcurrency: 0,
                screenResolution: "",
                availableScreenResolution: "",
                timezoneOffset: 0,
                canvas: "",
            },
            FirstVisit: false,
            expireTime: undefined,
            setFingerprint: () => {
                const fingerprint: Fingerprint = {
                    userAgent: "",
                    language: "",
                    pixelRatio: 0,
                    hardwareConcurrency: 0,
                    screenResolution: "",
                    availableScreenResolution: "",
                    timezoneOffset: 0,
                    canvas: "",
                };

                const expireTime: any = get().expireTime; // createJsonStorage doesn't persist type of date accurately
                const currentTime = new Date();
                if (!expireTime) {
                    set({
                        expireTime: new Date(
                            currentTime.getTime() + 10 * 60000
                        ),
                    });
                } else if (
                    expireTime &&
                    currentTime.toISOString() > expireTime
                ) {
                    set({ FirstVisit: false, expireTime: undefined });
                } else if (
                    expireTime &&
                    new Date(currentTime.getTime() + 5 * 60000).toISOString() >
                        expireTime
                ) {
                    set({
                        expireTime: new Date(
                            currentTime.getTime() + 10 * 60000
                        ),
                    });
                }

                const existingFingerprint = get().Fingerprint.canvas || null;
                if (existingFingerprint) {
                    return existingFingerprint;
                }

                fingerprint.userAgent = navigator.userAgent;
                fingerprint.language = navigator.language;

                fingerprint.pixelRatio = window.devicePixelRatio;

                fingerprint.screenResolution =
                    screen.width + "x" + screen.height;
                fingerprint.availableScreenResolution =
                    screen.availWidth + "x" + screen.availHeight;

                fingerprint.hardwareConcurrency = navigator.hardwareConcurrency;

                fingerprint.timezoneOffset = new Date().getTimezoneOffset();

                fingerprint.canvas = getCanvasFingerprint();

                set({ Fingerprint: fingerprint });
            },
            setFirstVisit: () => {
                set({ FirstVisit: true });
            },
            addToCartEvent: (productId: string) => {
                const cart = localStorage.getItem("cart-storage");
                const cartStorage: Product[] = cart
                    ? JSON.parse(cart).state.items
                    : undefined;
                if (!cartStorage || !cartStorage.length)
                    analysisPost(
                        get().Fingerprint.canvas,
                        "AddedToCart",
                        productId
                    );
            },
            reachedCheckoutEvent: (orderValue: string) => {
                analysisPost(
                    get().Fingerprint.canvas,
                    "ReachedCheckout",
                    orderValue
                );
            },
            convertedEvent: (status: string) => {
                analysisPost(get().Fingerprint.canvas, "Converted", status);
            },
        }),
        {
            name: "event-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useEvent;

function getCanvasFingerprint() {
    const existingCanvas = document.getElementById("fingerprint");
    if (existingCanvas) {
        return (existingCanvas as HTMLCanvasElement).toDataURL();
    }
    const canvas = document.createElement("canvas");
    canvas.id = "fingerprint";
    const ctx = canvas.getContext("2d")!;

    const width = 50;
    const height = 50;

    canvas.width = width;
    canvas.height = height;

    ctx.textBaseline = "top";

    ctx.fillStyle = "#f60";
    ctx.font = "14px 'Arial'";
    ctx.fillRect(20, 20, 60, 20);

    ctx.fillStyle = "#069";
    ctx.fillText("Test Fingerprint", 40, 30);

    const dataURL = canvas.toDataURL();

    return getCRC32(dataURL).toString();
}

function getCRC32(data: string) {
    let crc = -1;

    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ data.charCodeAt(i)) & 0xff];
    }

    return (crc ^ -1) >>> 0;
}

// CRC32 table for fast calculation
const crcTable = (function () {
    const table = new Array(256);

    for (let i = 0; i < 256; i++) {
        let crc = i;

        for (let j = 0; j < 8; j++) {
            crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
        }

        table[i] = crc >>> 0;
    }

    return table;
})();
