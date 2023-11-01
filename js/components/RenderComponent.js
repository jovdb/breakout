class RendarableComponent {
    addTo(entity) {
        entity.canRender = true;
        return entity;
    }
    removeFrom(entity) {
        delete entity.canRender;
    }
    isOn(entity) {
        return !!entity.canRender;
    }
}
/** Indicates that this entity can be rendered */
export const renderableComponent = new RendarableComponent();
//# sourceMappingURL=RenderComponent.js.map