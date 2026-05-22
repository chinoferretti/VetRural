package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Vacunacion;
import java.util.List;

@Repository
public interface VacunacionRepository extends JpaRepository<Vacunacion, Long> {
    List<Vacunacion> findByBovinoOrderByFechaHoraDesc(Bovino bovino);
}
