<script>
  export let progress = 0;
  export let total = 0;
</script>

<style>
  .progress-banner {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4a90e2;
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="progress-banner">
  {progress}/{total} subscriptions processed
</div>
