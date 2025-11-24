// تفعيل رابط النافبار النشط حسب الصفحة الحالية
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("nav a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;

    // الصفحة الرئيسية
    if ((path === "" || path === "index.html") && href.endsWith("index.html")) {
      link.classList.add("active");
    } else if (href.endsWith(path)) {
      link.classList.add("active");
    }
  });
});
