// ==UserScript==
// @name         FINGERPRINT MARGO
// @namespace    http://tampermonkey.net/
// @version      2025-07-31
// @description  Fingerprint Margo z FingerprintJS
// @author       Adrianosky
// @match        https://*.margonem.pl/
// @exclude      https://www.margonem.pl/
// @match        https://*.margonem.com/
// @exclude      https://www.margonem.com/
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/AdisonLee99/margo-fingerprint-client/main/index.js
// @downloadURL  https://raw.githubusercontent.com/AdisonLee99/margo-fingerprint-client/main/index.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=margonem.pl
// ==/UserScript==

(async function () {
  "use strict";
  const match = document.cookie.match(/interface=(\w+)/);
  const iface = match ? match[1] : "default";

  const accountId = iface === "ni" ? Engine.hero.d.account : hero.id;
  const fpKey = `fp_${accountId}`;
  const currentFp =
    typeof GET_FP !== "undefined" && typeof GET_FP.fp !== "undefined"
      ? GET_FP.fp
      : null;
  const savedData = await GM_getValue(fpKey, null);

  let fpStatus = "aktualny"; // domyślnie
  if (savedData) {
    if (savedData.current !== currentFp) {
      fpStatus = "zmienił się";
      await GM_setValue(fpKey, { old: savedData.current, current: currentFp });
    }
  } else {
    await GM_setValue(fpKey, { old: currentFp, current: currentFp });
  }

  if (iface !== "ni" && iface !== "si") return;
  const waitFor = (cond, interval = 200, timeout = 5000) =>
    new Promise((res, rej) => {
      const start = Date.now();
      (function check() {
        if (cond()) return res();
        if (Date.now() - start > timeout) return rej();
        setTimeout(check, interval);
      })();
    });

  waitFor(
    () => typeof GET_FP !== "undefined" && typeof GET_FP.fp !== "undefined"
  ).then(() => {
    const savedPosition = JSON.parse(
      localStorage.getItem("fp_widget_position")
    ) || { top: 27, left: window.innerWidth / 2 };

    const d = document.createElement("div");
    d.id = "fp-widget";
    Object.assign(d.style, {
      position: "fixed",
      top: `${savedPosition.top}px`,
      left: `${savedPosition.left}px`,
      transform: "translate(-50%, 0)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "rgb(215 215 215)",
      padding: "8px 12px",
      borderRadius: "12px",
      width: "min-width",
      fontSize: "12px",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      textAlign: "center",
      zIndex: 9999,
      boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      cursor: "move",
      border: "1px solid #ffffff80",
      userSelect: "none",
    });

    let isDragging = false;
    let offsetX, offsetY;

    d.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") return;
      isDragging = true;
      offsetX = e.clientX - d.getBoundingClientRect().left;
      offsetY = e.clientY - d.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      d.style.left = `${x}px`;
      d.style.top = `${y}px`;
      d.style.transform = "none";

      localStorage.setItem(
        "fp_widget_position",
        JSON.stringify({ top: y, left: x })
      );
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Fingerprint text
    const textSpan = document.createElement("span");
    textSpan.textContent = MY_GET_FP.fp;
    Object.assign(textSpan.style, {
      userSelect: "text",
      display: "inline-block",
      maxWidth: "90px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
    });

    // Copy Button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 Copy";
    Object.assign(copyBtn.style, {
      background: "none",
      transition: "all 300ms ease-in-out",
      border: "none",
      color: "inherit",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "30px",
      fontSize: "14px",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "6px",
      border: "1px solid #ffffff80",
    });

    copyBtn.addEventListener("mouseenter", () => {
      copyBtn.style.backgroundColor = "#ffffff10";
      copyBtn.style.color = "#90EE90";
      copyBtn.style.borderColor = "#90EE90";
    });

    copyBtn.addEventListener("mouseleave", () => {
      copyBtn.style.backgroundColor = "transparent";
      copyBtn.style.color = "inherit";
      copyBtn.style.borderColor = "#ffffff80";
    });

    copyBtn.title = "Kopiuj fingerprint";
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const payload = {
        fp: MY_GET_FP.fp,
        nick: iface === "ni" ? Engine.hero.d.nick : hero.nick,
      };
      navigator.clipboard
        .writeText(JSON.stringify(payload, null, 2))
        .then(() => {
          copyBtn.textContent = "✅ Copied!";
          textSpan.style.color = "#90EE90";
          setTimeout(() => {
            copyBtn.textContent = "📋 Copy";
            textSpan.style.color = "inherit";
          }, 2000);
        });
    });

    // Link Button
    const linkBtn = document.createElement("a");
    linkBtn.textContent = "🌐 Check";
    linkBtn.href = `https://margo-finger-check.lovable.app/`;
    linkBtn.target = "_blank";
    linkBtn.rel = "noopener noreferrer";
    Object.assign(linkBtn.style, {
      background: "transparent",
      transition: "all 300ms ease-in-out",
      textDecoration: "none",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      height: "30px",
      justifyContent: "center",
      border: "1px solid #ffffff80",
      boxSizing: "border-box",
      color: "inherit",
      fontSize: "14px",
      padding: "4px 8px",
      borderRadius: "6px",
      marginLeft: "8px",
    });

    linkBtn.addEventListener("mouseenter", () => {
      linkBtn.style.backgroundColor = "#ffffff10";
      linkBtn.style.color = "#90EE90";
      linkBtn.style.borderColor = "#90EE90";
    });

    linkBtn.addEventListener("mouseleave", () => {
      linkBtn.style.backgroundColor = "transparent";
      linkBtn.style.color = "inherit";
      linkBtn.style.borderColor = "#ffffff80";
    });

    // Toggle Button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "🔽";
    toggleBtn.title = "Zwiń / Rozwiń";
    Object.assign(toggleBtn.style, {
      background: "transparent",
      border: "none",
      fontSize: "14px",
      color: "inherit",
      cursor: "pointer",
      marginLeft: "6px",
    });

    const infoSpan = document.createElement("span");
    infoSpan.textContent = `Fingerprint: ${fpStatus}`;
    Object.assign(infoSpan.style, {
      fontWeight: "bold",
      color: fpStatus === "zmienił się" ? "orange" : "lightgreen",
      marginRight: "8px",
    });

    let isMinimized = JSON.parse(
      localStorage.getItem("fp_widget_minimized") || "false"
    );
    toggleBtn.addEventListener("click", () => {
      isMinimized = !isMinimized;
      localStorage.setItem("fp_widget_minimized", JSON.stringify(isMinimized));
      infoSpan.style.display = isMinimized ? "none" : "inline-flex";
      textSpan.style.display = isMinimized ? "none" : "inline-block";
      copyBtn.style.display = isMinimized ? "none" : "inline-flex";
      linkBtn.style.display = isMinimized ? "none" : "inline-flex";
      toggleBtn.textContent = isMinimized ? "▶️ FP" : "🔽";
    });

    if (isMinimized) {
      infoSpan.style.display = "none";
      textSpan.style.display = "none";
      copyBtn.style.display = "none";
      linkBtn.style.display = "none";
      toggleBtn.textContent = "▶️ FP";
    }

    d.insertBefore(infoSpan, d.firstChild);
    d.appendChild(textSpan);
    d.appendChild(copyBtn);
    d.appendChild(linkBtn);
    d.appendChild(toggleBtn);
    document.body.appendChild(d);
  });
})();
