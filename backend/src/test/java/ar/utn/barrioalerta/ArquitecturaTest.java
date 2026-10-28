package ar.utn.barrioalerta;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.web.bind.annotation.RestController;

/**
 * Validación del diseño (U8): las decisiones de arquitectura del lineamiento (D2, D3) expresadas
 * como reglas que fallan en CI si alguien las rompe.
 */
@AnalyzeClasses(packages = "ar.utn.barrioalerta", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquitecturaTest {

    @ArchTest
    static final ArchRule elDominioNoDependeDeFrameworksNiDeInfraestructura = noClasses()
            .that().resideInAPackage("..dominio..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("org.springframework..", "..api..", "..infraestructura..")
            .because("el dominio solo conoce Java y otros dominios (D3: puertos y adaptadores)");

    @ArchTest
    static final ArchRule losModulosNoTienenDependenciasCiclicas = slices()
            .matching("ar.utn.barrioalerta.(*)..")
            .should().beFreeOfCycles()
            .because("los módulos deben poder extraerse a servicios en el futuro (D2)");

    @ArchTest
    static final ArchRule losControllersVivenEnLaCapaApi = classes()
            .that().areAnnotatedWith(RestController.class)
            .should().resideInAPackage("..api..");

    @ArchTest
    static final ArchRule elDominioNoConoceAlModuloDeNotificaciones = noClasses()
            .that().resideInAPackage("..incidentes..")
            .should().dependOnClassesThat().resideInAPackage("..notificaciones..")
            .because("las notificaciones reaccionan a eventos; el incidente no sabe quién lo escucha (D7)");
}
