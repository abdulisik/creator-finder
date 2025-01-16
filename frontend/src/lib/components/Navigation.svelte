<script lang="ts">
  import { searchStore } from '../stores/search';
</script>

<style>
  nav {
    text-align: center;
    margin: 20px 0;
    padding: 0 20px;
  }
  nav a {
    margin: 0 10px;
    text-decoration: none;
    color: #2c5282;
    padding: 5px;
    display: inline-block;
    word-break: break-word;
  }
  nav a:hover {
    text-decoration: underline;
  }
  nav a:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
    border-radius: 2px;
  }
</style>

<nav aria-label="Main navigation">
  <a href="/" aria-current={!$searchStore.query ? 'page' : undefined}>Home</a> | 
  <a href="/MySubs">Subscriptions</a> |
  <a href="/terms.txt">Terms</a> | 
  <a href="/faq.txt">FAQ</a>
</nav>
