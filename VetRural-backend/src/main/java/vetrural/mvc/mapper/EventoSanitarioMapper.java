package vetrural.mvc.mapper;

import org.hibernate.Hibernate;
import vetrural.mvc.dto.response.EventoSanitarioResponse;
import vetrural.mvc.entity.EventoSanitario;

public final class EventoSanitarioMapper {

    private EventoSanitarioMapper() {}

    public static EventoSanitarioResponse toResponse(EventoSanitario e) {
        return new EventoSanitarioResponse(
                e.getId(),
                Hibernate.getClass(e).getSimpleName(),
                e.getFechaHora(),
                e.getBovino().getId(),
                e.getSesion().getId()
        );
    }
}
