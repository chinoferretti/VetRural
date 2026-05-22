package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Sesion;

import java.util.List;

public interface SesionRepository extends JpaRepository<Sesion, Long> {
    List<Sesion> findByEstablecimientoOrderByFechaHoraDesc(Establecimiento establecimiento);
}
