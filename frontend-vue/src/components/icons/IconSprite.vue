<template>
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
        <symbol id="i-home" viewBox="0 0 24 24">
            <path
                d="M12.5 3.2a1 1 0 0 0-1 0L3.5 7.8a1 1 0 0 0-.5.9V20a1 1 0 0 0 1 1h5.5v-6h5v6H20a1 1 0 0 0 1-1V8.7a1 1 0 0 0-.5-.9l-8-4.6z" />
        </symbol>
        <symbol id="i-home-o" viewBox="0 0 24 24">
            <path
                d="M12 5.1 5 9.2V19h4v-6h6v6h4V9.2l-7-4.1zm-.5-1.9a1 1 0 0 1 1 0l8 4.6a1 1 0 0 1 .5.9V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1V8.7a1 1 0 0 1 .5-.9l8-4.6z" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
            <path
                d="M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.24 4.25 1.42-1.42-4.25-4.24A7.5 7.5 0 0 0 10.5 3zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" />
        </symbol>
        <symbol id="i-library" viewBox="0 0 24 24">
            <path d="M3 22V2h2v20H3zm5 0V2h2v20H8zm5.13-19.63 6.77 18.33-1.88.7-6.77-18.34 1.88-.7z" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
            <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z" />
        </symbol>
        <symbol id="i-heart-o" viewBox="0 0 24 24">
            <path
                d="M12 20.6C7 16.8 3.8 13.4 3.8 9.9c0-2.8 2.1-4.9 4.7-4.9 1.5 0 2.8.7 3.5 1.9.7-1.2 2-1.9 3.5-1.9 2.6 0 4.7 2.1 4.7 4.9 0 3.5-3.2 6.9-8.2 10.7z"
                fill="none" stroke="currentColor" stroke-width="1.8" />
        </symbol>
        <symbol id="i-heart-f" viewBox="0 0 24 24">
            <path
                d="M12 21.3C6.4 17 3 13.6 3 9.9 3 6.7 5.4 4.2 8.5 4.2c1.4 0 2.7.6 3.5 1.6.8-1 2.1-1.6 3.5-1.6 3.1 0 5.5 2.5 5.5 5.7 0 3.7-3.4 7.1-9 11.4z" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
            <path d="M7.05 3.6a.7.7 0 0 1 1.05-.6l13.5 7.8a.7.7 0 0 1 0 1.2L8.1 19.8a.7.7 0 0 1-1.05-.6V3.6z" />
        </symbol>
        <symbol id="i-pause" viewBox="0 0 24 24">
            <path
                d="M5.7 3a.7.7 0 0 0-.7.7v16.6c0 .4.3.7.7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6c0 .4.3.7.7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z" />
        </symbol>
        <symbol id="i-prev" viewBox="0 0 24 24">
            <path
                d="M6.3 4.3a.7.7 0 0 0-.7.7v14c0 .4.3.7.7.7h1.4a.7.7 0 0 0 .7-.7v-5.6l8.9 5.9a.7.7 0 0 0 1.1-.6V5.3a.7.7 0 0 0-1.1-.6l-8.9 5.9V5a.7.7 0 0 0-.7-.7H6.3z" />
        </symbol>
        <symbol id="i-next" viewBox="0 0 24 24">
            <path
                d="M17.7 4.3c.4 0 .7.3.7.7v14a.7.7 0 0 1-.7.7h-1.4a.7.7 0 0 1-.7-.7v-5.6l-8.9 5.9a.7.7 0 0 1-1.1-.6V5.3a.7.7 0 0 1 1.1-.6l8.9 5.9V5c0-.4.3-.7.7-.7h1.4z" />
        </symbol>
        <symbol id="i-shuffle" viewBox="0 0 24 24">
            <path
                d="M18 4h4.5v4.5h-1.8V7.1l-4.9 4.9-1.3-1.3 4.9-4.9H18V4zM1.5 5.8h5l3.2 3.2-1.3 1.3-2.7-2.7h-4.2v-1.8zm13 8.7 1.3-1.3 3.4 3.4v-1.8h1.8v4.5H16.5v-1.8h1.8l-3.8-3zm-4.1-1.4 1.3 1.3-3.2 3.2h-7v-1.8h4.2l4.7-2.7z" />
        </symbol>
        <symbol id="i-repeat" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </symbol>
        <symbol id="i-repeat-1" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
        </symbol>
        <symbol id="i-volume" viewBox="0 0 24 24">
            <path
                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
        </symbol>
        <symbol id="i-volume-off" viewBox="0 0 24 24">
            <path
                d="M3.27 1.44 2 2.72l2.05 2.06C4.02 5.27 4 5.62 4 6v6h4l5 5v-4.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.98 3.68-1.91l2.04 2.04 1.27-1.27L3.27 1.44zM13 5.07l-2.28 2.28 2.28 2.28V5.07zM16.5 12c0-.85-.23-1.64-.63-2.33l2.08-2.08C18.6 8.58 19 10.24 19 12c0 2.21-.91 4.21-2.38 5.65l-1.43-1.43c1.06-1.06 1.81-2.52 1.81-4.22z" />
        </symbol>
        <symbol id="i-tv" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </symbol>
        <symbol id="i-queue" viewBox="0 0 24 24">
            <path
                d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zm14-10v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
        </symbol>
        <symbol id="i-mic" viewBox="0 0 24 24">
            <path
                d="M12 14.5a3 3 0 0 0 3-3v-6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5.3-3a5.3 5.3 0 0 1-10.6 0H4.9a7.1 7.1 0 0 0 6.2 7v2.7h1.8V18.5a7.1 7.1 0 0 0 6.2-7h-1.8z" />
        </symbol>
        <symbol id="i-chev-down" viewBox="0 0 24 24">
            <path d="M12 15.6 4.9 8.5l1.4-1.4 5.7 5.7 5.7-5.7 1.4 1.4z" />
        </symbol>
        <symbol id="i-chev-up" viewBox="0 0 24 24">
            <path d="M12 8.4 19.1 15.5l-1.4 1.4-5.7-5.7-5.7 5.7-1.4-1.4z" />
        </symbol>
        <symbol id="i-more" viewBox="0 0 24 24">
            <path
                d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </symbol>
        <symbol id="i-back" viewBox="0 0 24 24">
            <path d="M15.5 19.1 8.4 12l7.1-7.1 1.4 1.4L11.2 12l5.7 5.7z" />
        </symbol>
        <symbol id="i-fwd" viewBox="0 0 24 24">
            <path d="M8.5 4.9 15.6 12l-7.1 7.1-1.4-1.4L12.8 12 7.1 6.3z" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
            <path
                d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4zM11.1 6v6.5l4.7 2.8.9-1.5-3.8-2.3V6h-1.8z" />
        </symbol>
        <symbol id="i-radio" viewBox="0 0 24 24">
            <path
                d="M12 9.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zM7.6 7.6 6.3 6.3a8 8 0 0 0 0 11.4l1.3-1.3a6.2 6.2 0 0 1 0-8.8zm8.8 0a6.2 6.2 0 0 1 0 8.8l1.3 1.3a8 8 0 0 0 0-11.4l-1.3 1.3zM4.9 4.9 3.6 3.6a11.8 11.8 0 0 0 0 16.8l1.3-1.3a10 10 0 0 1 0-14.2zm14.2 0a10 10 0 0 1 0 14.2l1.3 1.3a11.8 11.8 0 0 0 0-16.8l-1.3 1.3z" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
            <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" />
        </symbol>
        <symbol id="i-trash" viewBox="0 0 24 24">
            <path d="M9 3h6v2h5v2H4V5h5V3zM6 8h12l-.9 13H6.9L6 8zm4 2 .3 9h1.5l-.3-9H10zm4 0-.3 9h1.5l.3-9H14z" />
        </symbol>
        <symbol id="i-save" viewBox="0 0 24 24">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.7L5 21V4a1 1 0 0 1 1-1zm1 2v12.3l5-3.3 5 3.3V5H7z" />
        </symbol>
        <symbol id="i-save-f" viewBox="0 0 24 24">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.7L5 21V4a1 1 0 0 1 1-1z" />
        </symbol>
        <symbol id="i-download" viewBox="0 0 24 24">
            <path d="M11 3h2v10.2l3.6-3.6L18 11l-6 6-6-6 1.4-1.4L11 13.2V3zM4 19h16v2H4v-2z" />
        </symbol>
        <symbol id="i-android" viewBox="0 0 24 24">
            <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V9H6v9zm13.5-12.1l1.4-1.4a.996.996 0 1 0-1.41-1.41l-1.55 1.55C16.5 3.6 14.36 3 12 3s-4.5.6-5.94 1.64L4.51 3.09a.996.996 0 1 0-1.41 1.41l1.4 1.4C2.7 7.37 1.5 9.55 1.5 12H22.5c0-2.45-1.2-4.63-3-6.1zM7.5 9c-.83 0-1.5-.67-1.5-1.5S6.67 6 7.5 6s1.5.67 1.5 1.5S8.33 9 7.5 9zm9 0c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z" />
        </symbol>
        <symbol id="i-upload" viewBox="0 0 24 24">
            <path d="M13 21h-2V10.8l-3.6 3.6L6 13l6-6 6 6-1.4 1.4-3.6-3.6V21zM4 3h16v2H4V3z" />
        </symbol>
        <symbol id="i-expand" viewBox="0 0 24 24">
            <path d="M3 3h8v2H5v6H3V3zm10 0h8v8h-2V5h-6V3zM3 13h2v6h6v2H3v-8zm16 0h2v8h-8v-2h6v-6z" />
        </symbol>
        <symbol id="i-chart" viewBox="0 0 24 24">
            <path d="M4 20V10h4v10H4zm6 0V4h4v16h-4zm6 0v-7h4v7h-4z" />
        </symbol>
        <symbol id="i-note" viewBox="0 0 24 24">
            <path d="M10 3v10.6a3.5 3.5 0 1 0 2 3.2V7h6V3h-8z" />
        </symbol>
        <symbol id="i-sun" viewBox="0 0 24 24">
            <path
                d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2zM4.2 3.8l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zM3.8 19.8l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4zm12.1-12.1 2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4z" />
        </symbol>
        <symbol id="i-moon" viewBox="0 0 24 24">
            <path d="M15.2 2.1A9.8 9.8 0 1 0 21.9 15 8 8 0 0 1 15.2 2.1z" />
        </symbol>
        <symbol id="i-pip" viewBox="0 0 24 24">
            <path
                d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-15zM5 5v14h14V5H5zm7 6h6v6h-6v-6z" />
        </symbol>
        <symbol id="i-share" viewBox="0 0 24 24">
            <path d="M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14V4zM5 7h7v2H7v8h8v-4h2v6H5V7z" />
        </symbol>
    </svg>
</template>