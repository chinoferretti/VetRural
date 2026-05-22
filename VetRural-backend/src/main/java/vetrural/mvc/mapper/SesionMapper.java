package vetrural.mvc.mapper;

import org.hibernate.Hibernate;
import vetrural.mvc.dto.response.SesionResponse;
import vetrural.mvc.entity.EventoSanitario;
import vetrural.mvc.entity.Sesion;

import java.util.Collections;
import java.util.List;

public final class SesionMapper {

    private SesionMapper() {}

    public static SesionResponse toResponse(Sesion s) {
        return toResponse(s, Collections.emptyList());
    }

    public static SesionResponse toResponse(Sesion s, List<EventoSanitario> eventos) {
        long totalAnimales = eventos.stream()
                .map(e -> e.getBovino().getId())
                .distinct()
                .count();

        List<String> trabajos = eventos.stream()
                .map(e -> {
                    String tipo = Hibernate.getClass(e).getSimpleName();
                    return switch (tipo) {
                        case "Pesaje"     -> "Pesaje";
                        case "Tacto"      -> "Tacto";
                        case "Boqueo"     -> "Boqueo";
                        case "Vacunacion" -> "Vacunación";
                        default           -> tipo;
                    };
                })
                .distinct()
                .sorted()
                .toList();

        return new SesionResponse(
                s.getId(),
                s.getFechaHora(),
                s.getVeterinario().getIdUsuario(),
                s.getVeterinario().getNombre() + " " + s.getVeterinario().getApellido(),
                s.getAnotador(),
                s.getEstablecimiento().getId(),
                s.getEstablecimiento().getNombre(),
                (int) totalAnimales,
                trabajos
        );
    }
}
