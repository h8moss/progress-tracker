import type { ContextMenuItem } from "../types";

class ContextMenuItems {
  items: ContextMenuItem[];

  private constructor() {
    this.items = [];
  }

  static new(): ContextMenuItems {
    return new ContextMenuItems();
  }

  add(item: ContextMenuItem) {
    this.items = [...this.items, item];

    return this;
  }

  addIf(item: ContextMenuItem, condition: boolean) {
    if (condition) return this.add(item);

    return this;
  }

  addAll(items: ContextMenuItem[]) {
    this.items = [...this.items, ...items];
    return this;
  }

  addAllIf(items: ContextMenuItem[], condition: boolean) {
    if (condition) return this.addAll(items);

    return this;
  }
}

export default ContextMenuItems;
