"use client";

import { useEffect } from "react";

import analysisPost from "@/lib/analysis_post";
import { usePathname } from "next/navigation";
import useEvent from "@/hooks/use-event";

export interface Fingerprint {
    userAgent: string;
    language: string;
    pixelRatio: number;
    hardwareConcurrency: number;
    screenResolution: string;
    availableScreenResolution: string;
    timezoneOffset: number;
    canvas: string;
}

export function Analytics() {
    const events = useEvent();
    useEffect(() => {
        events.setFingerprint();
        const handleFirstVisit = () => {
            if (events.FirstVisit) return;
            const data =
                document.referrer.split("/")[2] !==
                document.location.href.split("/")[2]
                    ? document.referrer.split("/")[2] || "Search"
                    : "Search";
            analysisPost(events.Fingerprint.canvas, "FirstVisit", data);
            events.setFirstVisit();
        };

        window.addEventListener("load", handleFirstVisit);

        return () => {
            window.removeEventListener("load", handleFirstVisit);
        };
    }, [events]);

    return (
        <>
            <PageChangeEvent />
        </>
    );
}

const PageChangeEvent = () => {
    const path = usePathname();
    const { Fingerprint } = useEvent();
    useEffect(() => {
        analysisPost(Fingerprint.canvas, "PageVisit", path);
    }, [path, Fingerprint]);
    return null;
};
