package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.EventoSanitario;
import vetrural.mvc.entity.Sesion;
import java.util.List;

@Repository
public interface EventoSanitarioRepository extends JpaRepository<EventoSanitario, Long> {
    List<EventoSanitario> findByBovinoOrderByFechaHoraDesc(Bovino bovino);
    List<EventoSanitario> findBySesion(Sesion sesion);
}
