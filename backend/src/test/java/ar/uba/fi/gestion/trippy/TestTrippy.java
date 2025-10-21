package ar.uba.fi.gestion.trippy;

import ar.uba.fi.gestion.trippy.field.*;
import ar.uba.fi.gestion.trippy.match.TestMatch;
import ar.uba.fi.gestion.trippy.user.TestUserCreateDTO;
import ar.uba.fi.gestion.trippy.user.TestUserLoginDTO;
import ar.uba.fi.gestion.trippy.match.matchOrganizer.TestMatchOrganizer;

import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.junit.platform.launcher.listeners.TestExecutionSummary;

public class TestTrippy {

	public static void main(String[] args) {
		SummaryGeneratingListener listener = new SummaryGeneratingListener();

		LauncherDiscoveryRequest request = LauncherDiscoveryRequestBuilder.request()
				.selectors(
						DiscoverySelectors.selectClass(TestField.class),
						DiscoverySelectors.selectClass(TestFieldCreateDTO.class),
						DiscoverySelectors.selectClass(TestFieldSchedule.class),
						DiscoverySelectors.selectClass(TestReservationCreateDTO.class),
						DiscoverySelectors.selectClass(TestReviewCreateDTO.class),
						DiscoverySelectors.selectClass(TestMatchOrganizer.class),
						DiscoverySelectors.selectClass(TestMatch.class),
						DiscoverySelectors.selectClass(TestUserCreateDTO.class),
						DiscoverySelectors.selectClass(TestUserLoginDTO.class)
				)
				.build();

		Launcher launcher = LauncherFactory.create();
		launcher.registerTestExecutionListeners(listener);
		launcher.execute(request);

		TestExecutionSummary summary = listener.getSummary();

		System.out.println("✅ Tests run: " + summary.getTestsFoundCount());
		System.out.println("✅ Tests succeeded: " + summary.getTestsSucceededCount());
		System.out.println("❌ Tests failed: " + summary.getTestsFailedCount());

		summary.getFailures().forEach(failure ->
				System.out.println("❌ Failure in " + failure.getTestIdentifier().getDisplayName() +
						": " + failure.getException().getMessage())
		);

		System.exit(summary.getTestsFailedCount() > 0 ? 1 : 0);
	}
}
