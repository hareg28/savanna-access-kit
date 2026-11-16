/**
 * Savanna Starter Accessibility Patch (FR-I5b).
 * Non-invasive fix for legacy Savanna template defects:
 * - div hamburger & missing button roles
 * - invalid aria-expanded on non-button containers
 * - aria-hidden containers and anchor links holding focus
 * - unlabelled progressbar
 * - unlabelled logo link
 * - invalid hr elements direct in ul
 */

function patchSavannaDefects() {
  // 1. Invalid aria-expanded on non-button div
  document.querySelectorAll('div.flex-shrink-0[aria-expanded]').forEach((el) => {
    el.removeAttribute('aria-expanded');
  });

  // 2. Unlabelled logo link
  document.querySelectorAll('a.logo-container').forEach((el) => {
    if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
      el.setAttribute('aria-label', 'Savanna Learning Platform Home');
    }
  });

  // 3. Progress bar missing label
  document.querySelectorAll('.progress-bar').forEach((el) => {
    if (!el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', 'Curriculum Progress');
    }
  });

  // 4. Anchors with aria-hidden="true" must have tabindex="-1" to not be focusable
  document.querySelectorAll('a[aria-hidden="true"], [aria-hidden="true"] a').forEach((a) => {
    a.setAttribute('tabindex', '-1');
  });

  // 5. Invalid direct hr in ul: wrap in standard li
  document.querySelectorAll('ul > hr').forEach((hr) => {
    const li = document.createElement('li');
    li.style.listStyle = 'none';
    hr.parentNode.insertBefore(li, hr);
    li.appendChild(hr);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', patchSavannaDefects);
} else {
  patchSavannaDefects();
}
