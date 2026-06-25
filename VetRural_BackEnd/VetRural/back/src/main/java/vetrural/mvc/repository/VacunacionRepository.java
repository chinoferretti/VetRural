package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Vacunacion;
import java.util.List;

@Repository
public interface VacunacionRepository extends JpaRepository<Vacunacion, Long> {
    List<Vacunacion> findByBovinoOrderByFechaHoraDesc(Bovino bovino);

    @Query("SELECT v FROM Vacunacion v WHERE v.bovino.establecimiento.id = :estId ORDER BY v.bovino.id, v.fechaHora DESC")
    List<Vacunacion> findAllByEstablecimientoId(@Param("estId") Long estId);
}
