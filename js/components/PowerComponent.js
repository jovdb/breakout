class PowerComponent {
    addTo(entity) {
        entity.hasPower = true;
        return entity;
    }
    removeFrom(entity) {
        delete entity.hasPower;
    }
    isOn(entity) {
        return !!entity.hasPower;
    }
}
/** Adds gravity to the entity: it will fall down */
export const powerComponent = new PowerComponent();
//# sourceMappingURL=PowerComponent.js.map