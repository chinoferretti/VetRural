package vetrural.mvc.entity;

import java.time.LocalDate;
import vetrural.mvc.enumerations.SexoEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Animal")
@Inheritance(strategy = InheritanceType.JOINED)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public abstract class Animal {
    @Id
    @Column(length = 15, nullable = false, unique = true) // Caravana electrónica de 15 dígitos
    private String idAnimal;

    private LocalDate nacimiento;

    @Enumerated(EnumType.STRING)
    private SexoEnum sexo;

    private String lote;
    private String observaciones;
}
