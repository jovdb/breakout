class SizeComponent {
    addTo(entity, width = 100, height = 100) {
        entity.width = width;
        entity.height = height;
        return entity;
    }
    removeFrom(entity) {
        delete entity.width;
        delete entity.height;
    }
    isOn(entity) {
        return "width" in entity;
    }
}
/** Adds a size (width, height) to the entity */
export const sizeComponent = new SizeComponent();
//# sourceMappingURL=SizeComponent.js.map