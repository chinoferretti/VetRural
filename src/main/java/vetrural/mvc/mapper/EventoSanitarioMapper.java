package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.EventoSanitarioResponse;
import vetrural.mvc.entity.EventoSanitario;

public final class EventoSanitarioMapper {

    private EventoSanitarioMapper() {}

    public static EventoSanitarioResponse toResponse(EventoSanitario e) {
        return new EventoSanitarioResponse(
                e.getId(),
                e.getClass().getSimpleName(),
                e.getFechaHora(),
                e.getBovino().getIdAnimal(),
                e.getRegistradoPor().getIdUsuario()
        );
    }
}
