<template>
  <div class="dropdown-menu" aria-labelledby="notificationsPopoverLink">
    
    <a class="entry" href="#?notif1">
      <div class="test">
        <div class="mx-3">
          Notification 1
        </div>
      </div>
    </a>

    <div class="dropdown-divider"></div>

    <a class="entry" href="#?notif2">
      <div class="test">
        <div class="mx-3">
          Notification 2
        </div>
      </div>
    </a>

    <div class="dropdown-divider"></div>

    <a class="entry" href="#?notif3">
      <div class="test">
        <div class="mx-3">
          Notification 3
        </div>
      </div>
    </a>

  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.dropdown-menu {
    width: 300px;
    text-align: center;
}

.test:hover {
  background-color: ivory;
}

.test {
  color: #000;
}

.entry {
  text-align: center;
  margin-top: 3px;
}
</style>
