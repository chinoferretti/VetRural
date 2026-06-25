package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricasResponse {
    private int totalBovinos;
    private int hembras;
    private int machos;
    private Integer edadPromedioMeses;
    private int bovinosConEdadEstimada;
    private Double pesoPromedio;
    private int conPeso;
    private int prenadas;
    private int totalTactadas;
    private int porcentajePrenez;
    private Map<String, Integer> vacunados;          // nombre → alguna vez vacunado
    private Map<String, Integer> vacunadosVigentes;  // nombre → vacunado dentro del intervalo vigente
    private List<String> lotes;
    private Map<String, Integer> distribucionTipo;
    private Map<String, Integer> distribucionDientes;
    private Map<String, Integer> distribucionDeterioro;
    private Map<String, Integer> distribucionTacto;
    private List<AlertaBovino> alertas;
}
