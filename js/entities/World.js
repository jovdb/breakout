import { renderableComponent } from "../components/RenderComponent.js";
import { sizeComponent } from "../components/SizeComponent.js";
import { createEntity } from "./Entity.js";
export function createWorld(width = 300, height = 300) {
    return createEntity("World", entity => {
        return renderableComponent.addTo((sizeComponent.addTo(entity, width, height)));
    });
}
export function isWorld(entity) {
    return entity.label === "World";
}
//# sourceMappingURL=World.js.map