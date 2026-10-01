      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-background to-amber-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.08),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Quality shoes, delivered across Kenya
            </span>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Step Into <span className="text-primary">Step N Carry</span> Style
            </h1>

            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              From sneakers to formal shoes, running trainers to elegant heels, bags. Browse, pick your size, and get delivery anywhere in Kenya.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/shop')}>
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/shop?filter=featured')}>
                View Featured
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Nationwide delivery
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Secure checkout
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted shadow-lg" />
                <div className="flex flex-col gap-4">
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted shadow-lg" />
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.pexels.com/photos/1456733/pexels-photo-1456733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Sneakers"
                  className="aspect-[3/4] w-full rounded-2xl object-cover shadow-lg"
                />
                <div className="flex flex-col gap-4">
                  <img
                    src="https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Formal shoes"
                    className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                  />
                  <img
                    src="https://images.pexels.com/photos/134064/pexels-photo-134064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Heels"
                    className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>