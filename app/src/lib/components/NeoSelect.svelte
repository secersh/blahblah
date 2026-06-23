<script lang="ts">
  type Option = {
    value: string;
    label: string;
    disabled?: boolean;
  };

  let {
    value,
    options,
    placeholder = 'Select',
    disabled = false,
    size = 'md',
    onChange
  }: {
    value: string;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    onChange: (value: string) => void;
  } = $props();

  let open = $state(false);
  let root = $state<HTMLDivElement | null>(null);
  const selectedOption = $derived(options.find((option) => option.value === value));

  function closeFromOutside(event: MouseEvent) {
    if (!open || root?.contains(event.target as Node)) return;
    open = false;
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  function selectOption(option: Option) {
    if (option.disabled) return;
    onChange(option.value);
    open = false;
  }
</script>

<svelte:window onclick={closeFromOutside} onkeydown={closeOnEscape} />

<div bind:this={root} class="neo-select relative" class:is-sm={size === 'sm'}>
  <button
    class="neo-select-button flex w-full items-center justify-between gap-3"
    type="button"
    disabled={disabled}
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={(event) => {
      event.stopPropagation();
      open = !open;
    }}
  >
    <span class="truncate">{selectedOption?.label ?? placeholder}</span>
    <span class="neo-select-arrow" aria-hidden="true"></span>
  </button>

  {#if open && !disabled}
    <div class="neo-select-menu absolute left-0 right-0 top-[calc(100%+0.35rem)] z-40" role="listbox">
      {#each options as option}
        <button
          class="neo-select-option flex w-full items-center justify-between gap-2"
          class:is-selected={option.value === value}
          type="button"
          role="option"
          aria-selected={option.value === value}
          disabled={option.disabled}
          onclick={(event) => {
            event.stopPropagation();
            selectOption(option);
          }}
        >
          <span class="truncate">{option.label}</span>
          {#if option.value === value}
            <span class="text-xs font-black">SET</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .neo-select {
    min-width: 0;
  }

  .neo-select-button {
    min-height: 2.75rem;
    border: 3px solid #11100d;
    border-radius: 0.45rem;
    background: #ffffff;
    color: #11100d;
    padding: 0.45rem 0.75rem;
    font-weight: 900;
    line-height: 1.2;
  }

  .is-sm .neo-select-button {
    min-height: 2.4rem;
    padding: 0.35rem 0.7rem;
    font-size: 0.875rem;
  }

  .neo-select-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .neo-select-arrow {
    width: 0.65rem;
    height: 0.65rem;
    border-right: 3px solid #11100d;
    border-bottom: 3px solid #11100d;
    transform: translateY(-0.15rem) rotate(45deg);
  }

  .neo-select-menu {
    max-height: 16rem;
    overflow: auto;
    border: 3px solid #11100d;
    border-radius: 0.45rem;
    background: #ffffff;
    box-shadow: 5px 5px 0 #11100d;
  }

  .neo-select-option {
    min-height: 2.35rem;
    border: 0;
    border-bottom: 2px solid #11100d;
    background: #ffffff;
    color: #11100d;
    padding: 0.55rem 0.75rem;
    text-align: left;
    font-weight: 900;
  }

  .neo-select-option:last-child {
    border-bottom: 0;
  }

  .neo-select-option:hover:not(:disabled),
  .neo-select-option.is-selected {
    background: #ffe34f;
  }

  .neo-select-option:disabled {
    cursor: not-allowed;
    background: #f8f1dd;
    color: rgba(17, 16, 13, 0.45);
  }
</style>
