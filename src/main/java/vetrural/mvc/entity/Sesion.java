package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Sesion")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Sesion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSesion;

    private String establecimiento;
    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraFin;
    
    @ManyToOne
    @JoinColumn(name = "anotador_id")
    private Usuario anotador;

    @ManyToOne
    @JoinColumn(name = "veterinario_id")
    private Usuario veterinario;
    private int contBovinos;
    private float acumPeso;
    private int contPrenadas;
    private int contVacias;
    private float edadPromedio;
}
