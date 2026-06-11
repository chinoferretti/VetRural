package vetrural.mvc.entity;

import java.time.LocalDate;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Bovino")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Bovino {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 15, nullable = false, unique = true) // Caravana electrónica de hasta 15 dígitos
    private String caravana;

    @ManyToOne(optional = false)
    @JoinColumn(name = "establecimiento_id", nullable = false)
    private Establecimiento establecimiento;

    @Enumerated(EnumType.STRING)
    private RazaBovinoEnum raza;

    @Enumerated(EnumType.STRING)
    private TipoBovinoEnum tipo;

    @Enumerated(EnumType.STRING)
    private SexoEnum sexo;

    private LocalDate nacimiento;
    private String lote;
    private String observaciones;
    private String apodo;
}
