/**
 * cards block
 *
 * This component does not require JavaScript initialization.
 */

export default function decorate(block) {
  block.querySelectorAll('h4').forEach((h4) => {
    const h2 = document.createElement('h2');
    if (h4.id) h2.id = h4.id;
    h2.className = h4.className;
    h2.innerHTML = h4.innerHTML;
    h4.replaceWith(h2);
  });
}
