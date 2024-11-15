document.addEventListener('DOMContentLoaded', () => {
  const token =
    document
      ?.querySelector('[data-next-page]')
      ?.getAttribute('data-next-page') ?? '';
  setTimeout(() => {
    window.location.href = `/process-subscriptions?pageToken=${token}`;
  }, 50);
});
