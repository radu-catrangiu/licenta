<template>
  <div class="dropdown-menu" aria-labelledby="groupsPopoverLink">
    <a class="entry selected" href="#?test">
      <div class="test">
        <div class="mx-3">Action</div>
      </div>
    </a>

    <div class="dropdown-divider"></div>

    <a class="entry" href="#?bla">
      <div class="test">
        <div class="mx-3">Entry number 2</div>
      </div>
    </a>

    <div class="dropdown-divider"></div>

    <a class="entry" href="#?blabla">
      <div class="test">
        <div class="mx-3">Entry number 3</div>
      </div>
    </a>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
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

a.entry.selected {
  background-color: rgb(252, 188, 77);
}
</style>
