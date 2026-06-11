package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.BovinoResponse;
import vetrural.mvc.entity.Bovino;

public final class BovinoMapper {

    private BovinoMapper() {}

    public static BovinoResponse toResponse(Bovino b) {
        return new BovinoResponse(
                b.getId(),
                b.getCaravana(),
                b.getEstablecimiento() != null ? b.getEstablecimiento().getId() : null,
                b.getRaza(),
                b.getTipo(),
                b.getSexo(),
                b.getNacimiento(),
                b.getLote(),
                b.getObservaciones(),
                b.getApodo()
        );
    }
}
