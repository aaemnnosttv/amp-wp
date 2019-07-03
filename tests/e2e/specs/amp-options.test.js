/**
 * WordPress dependencies
 */
import { visitAdminPage, switchUserToAdmin, switchUserToTest } from '@wordpress/e2e-test-utils';

/**
 * Deactivates an active plugin.
 *
 * Not using the provided deactivatePlugin() utility because it uses page.click(),
 * which does not work if the element is not in the view or obscured by another element
 * like an admin pointer.
 *
 * @param {string} slug Plugin slug.
 */
async function deactivatePlugin( slug ) {
	await switchUserToAdmin();
	await visitAdminPage( 'plugins.php' );

	await page.evaluate( ( plugin ) => {
		const disableLink = document.querySelector( `tr[data-slug="${ plugin }"] .deactivate a` );

		if ( disableLink ) {
			disableLink.scrollIntoView();
			disableLink.click();
		}
	}, slug );

	await page.waitForSelector( `tr[data-slug="${ slug }"] .delete a` );
	await switchUserToTest();
}

/**
 * Activates an installed plugin.
 *
 * Not using the provided activatePlugin() utility because it uses page.click(),
 * which does not work if the element is not in the view or obscured by another element
 * like an admin pointer.
 *
 * @param {string} slug Plugin slug.
 */
async function activatePlugin( slug ) {
	await switchUserToAdmin();
	await visitAdminPage( 'plugins.php' );

	const disableLink = await page.$( `tr[data-slug="${ slug }"] .deactivate a` );
	if ( disableLink ) {
		return;
	}

	await page.evaluate( ( plugin ) => {
		const enableLink = document.querySelector( `tr[data-slug="${ plugin }"] .activate a` );

		if ( enableLink ) {
			enableLink.scrollIntoView();
			enableLink.click();
		}
	}, slug );

	await page.waitForSelector( `tr[data-slug="${ slug }"] .deactivate a` );
	await switchUserToTest();
}

describe( 'AMP Settings Screen', () => {
	it( 'Should display a welcome notice', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );
		const nodes = await page.$x(
			'//*[contains(@class,"amp-welcome-notice")]//h1[contains(text(), "Welcome to AMP for WordPress")]'
		);
		expect( nodes.length ).not.toEqual( 0 );
	} );

	it( 'Should display a warning about missing object cache', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );
		const nodes = await page.$x(
			'//*[contains(@class,"notice-warning")]//p[contains(text(), "The AMP plugin performs at its best when persistent object cache is enabled")]'
		);
		expect( nodes.length ).not.toEqual( 0 );
	} );

	it( 'Should display a message about theme compatibility', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );
		const nodes = await page.$x(
			'//*[contains(@class,"notice-success")]//p[contains(text(), "Your active theme is known to work well in standard or transitional mode.")]'
		);
		expect( nodes.length ).not.toEqual( 0 );
	} );

	it( 'Should toggle Website Mode section', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );

		await page.evaluate( () => {
			document.querySelector( 'tr.amp-website-mode' ).scrollIntoView();
		} );

		const websiteModeSection = await page.$( 'tr.amp-website-mode' );

		expect( await websiteModeSection.isIntersectingViewport() ).toBe( true );

		await page.click( '#website_experience' );

		expect( await websiteModeSection.isIntersectingViewport() ).toBe( false );
	} );

	it( 'Requires at least one AMP experience to be selected', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );

		expect( await page.$eval( '#amp-settings', ( el ) => el.matches( `:invalid` ) ) ).toBe( false );

		await page.click( '#website_experience' );

		expect( await page.$eval( '#amp-settings', ( el ) => el.matches( `:invalid` ) ) ).toBe( true );
	} );

	it( 'Should not allow AMP Stories to be enabled when Gutenberg is not active', async () => {
		await deactivatePlugin( 'gutenberg' );

		await visitAdminPage( 'admin.php', 'page=amp-options' );

		expect( await page.$eval( '#stories_experience', ( el ) => el.matches( `:disabled` ) ) ).toBe( true );

		const nodes = await page.$x(
			'//*[contains(@class,"notice-info")]//p[contains(text(), "To use stories, you currently must have the latest version")]'
		);
		expect( nodes.length ).not.toEqual( 0 );

		await activatePlugin( 'gutenberg' );
	} );

	it( 'Should allow AMP Stories to be enabled when Gutenberg is active', async () => {
		await visitAdminPage( 'admin.php', 'page=amp-options' );

		expect( await page.$eval( '#stories_experience', ( el ) => el.matches( `:disabled` ) ) ).toBe( false );
	} );
} );
