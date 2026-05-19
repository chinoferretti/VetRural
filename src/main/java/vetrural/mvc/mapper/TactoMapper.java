package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.TactoResponse;
import vetrural.mvc.entity.Tacto;

public final class TactoMapper {

    private TactoMapper() {}

    public static TactoResponse toResponse(Tacto t) {
        return new TactoResponse(
                t.getId(),
                t.getFechaHora(),
                t.getBovino().getId(),
                t.getRegistradoPor().getIdUsuario(),
                t.getSituacion(),
                t.getPeriodo()
        );
    }
}
